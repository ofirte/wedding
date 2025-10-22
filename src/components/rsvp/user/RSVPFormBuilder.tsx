import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Visibility as PreviewIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import CustomQuestionForm from "../CustomQuestionForm";
import {
  useRSVPConfig,
  useCreateDefaultRSVPConfig,
  useRSVPFormQuestions,
  useUpdateEnabledQuestions,
  useAddCustomQuestion,
} from "../../../hooks/rsvp/useRSVPQuestions";
import {
  getPredefinedQuestions,
  RSVPQuestion,
} from "../../../api/rsvp/rsvpQuestionsTypes";

interface RSVPFormBuilderProps {
  onComplete: () => void;
  isCompleted: boolean;
}

/**
 * RSVPFormBuilder - Inline RSVP form creation and editing
 *
 * Always starts with default questions and allows inline editing.
 * Users can toggle questions on/off and see a preview of their form.
 */
const RSVPFormBuilder: React.FC<RSVPFormBuilderProps> = ({
  onComplete,
  isCompleted,
}) => {
  const { t } = useTranslation();
  const { data: rsvpConfig, isLoading } = useRSVPConfig();
  const { questions: enabledQuestions } = useRSVPFormQuestions();
  const createDefaultConfig = useCreateDefaultRSVPConfig();
  const updateEnabled = useUpdateEnabledQuestions();
  const addCustomQuestion = useAddCustomQuestion();

  // Get translated predefined questions
  const PREDEFINED_QUESTIONS = useMemo(() => getPredefinedQuestions(t), [t]);

  const [selectedQuestions, setSelectedQuestions] = useState<RSVPQuestion[]>(
    []
  );
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [newCustomQuestion, setNewCustomQuestion] = useState({
    text: "",
    displayName: "",
    type: "boolean" as "boolean" | "select",
    options: ["", ""],
    booleanOptions: {
      trueOption: t("common.yes"),
      falseOption: t("common.no"),
    },
  });

  // Initialize with default questions when config is created
  useEffect(() => {
    if (rsvpConfig && enabledQuestions) {
      setSelectedQuestions(enabledQuestions);
      // Only auto-complete when we have questions selected AND haven't auto-completed before
      if (enabledQuestions.length > 0 && !hasAutoCompleted && !isCompleted) {
        onComplete();
        setHasAutoCompleted(true);
      }
    }
  }, [rsvpConfig, enabledQuestions, onComplete, isCompleted, hasAutoCompleted]);

  // Reset auto-complete flag when step is no longer completed (user navigated back)
  useEffect(() => {
    if (!isCompleted) {
      setHasAutoCompleted(false);
    }
  }, [isCompleted]);

  const handleCreateWithDefaults = async () => {
    try {
      await createDefaultConfig.mutateAsync("");
      // The useEffect will handle setting the selected questions
    } catch (error) {
      console.error("Error creating default RSVP form:", error);
    }
  };

  const handleToggleQuestion = async (question: RSVPQuestion) => {
    const isCurrentlySelected = selectedQuestions.some(
      (q) => q.id === question.id
    );

    // Prevent disabling required questions
    if (isCurrentlySelected && question.required) {
      return;
    }

    let newSelectedQuestions;
    if (isCurrentlySelected) {
      newSelectedQuestions = selectedQuestions.filter(
        (q) => q.id !== question.id
      );
    } else {
      newSelectedQuestions = [...selectedQuestions, question];
    }

    setSelectedQuestions(newSelectedQuestions);

    // Auto-save the changes
    try {
      const enabledIds = newSelectedQuestions.map((q) => q.id);
      await updateEnabled.mutateAsync(enabledIds);
    } catch (error) {
      console.error("Error updating questions:", error);
      // Revert on error
      setSelectedQuestions(selectedQuestions);
    }
  };

  const handleAddCustomQuestion = async () => {
    try {
      // Build question object conditionally to avoid undefined values
      const questionBase = {
        questionText: newCustomQuestion.text,
        displayName: newCustomQuestion.displayName,
        type: newCustomQuestion.type,
        required: false,
        order: PREDEFINED_QUESTIONS.length + 1,
      };

      // Add type-specific fields only when needed
      const question = {
        ...questionBase,
        ...(newCustomQuestion.type === "select" && {
          options: newCustomQuestion.options.filter((o) => o.trim()),
        }),
        ...(newCustomQuestion.type === "boolean" && {
          booleanOptions: newCustomQuestion.booleanOptions,
        }),
      };

      const customQuestionData = { question };

      await addCustomQuestion.mutateAsync(customQuestionData);
      setIsCustomDialogOpen(false);
      // Reset form
      setNewCustomQuestion({
        text: "",
        displayName: "",
        type: "boolean",
        options: ["", ""],
        booleanOptions: {
          trueOption: t("common.yes"),
          falseOption: t("common.no"),
        },
      });
    } catch (error) {
      console.error("Error adding custom question:", error);
    }
  };

  // Helper functions for CustomQuestionForm
  const addOption = () => {
    setNewCustomQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewCustomQuestion((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index: number) => {
    setNewCustomQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handlePreview = () => {
    // Open guest RSVP page in new window with example guestId
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split("/wedding/")[0];
    const weddingId = currentUrl.split("/wedding/")[1]?.split("/")[0];
    const previewUrl = `${baseUrl}/guest-rsvp/${weddingId}/example`;
    window.open(previewUrl, "_blank");
  };

  const renderQuestionOptions = (question: RSVPQuestion) => {
    if (question.type === "boolean" && question.booleanOptions) {
      return (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {t("common.options")}: {question.booleanOptions.trueOption} /{" "}
          {question.booleanOptions.falseOption}
        </Typography>
      );
    }

    if (question.type === "select" && question.options) {
      return (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {t("common.options")}: {question.options.slice(0, 3).join(", ")}
          {question.options.length > 3 && "..."}
        </Typography>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no config exists, show setup button
  if (!rsvpConfig) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {t("userRsvp.form.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t("userRsvp.form.description")}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleCreateWithDefaults}
          disabled={createDefaultConfig.isPending}
          sx={{ mt: 2 }}
        >
          {createDefaultConfig.isPending
            ? t("common.loading")
            : t("userRsvp.form.startWithDefaults")}
        </Button>

        {createDefaultConfig.isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {t("userRsvp.form.createError")}
          </Alert>
        )}
      </Box>
    );
  }

  // Show inline question editor
  return (
    <Box>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {t("userRsvp.form.availableQuestions")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCustomDialogOpen(true)}
            >
              {t("userRsvp.form.addCustom")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
            >
              {t("userRsvp.form.preview")}
            </Button>
          </Box>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          <List>
            {PREDEFINED_QUESTIONS.map((question) => {
              const isSelected = selectedQuestions.some(
                (q) => q.id === question.id
              );
              const canToggle = !question.required || !isSelected;

              return (
                <ListItem key={question.id} divider>
                  <ListItemText
                    primary={question.questionText}
                    secondary={
                      <Box>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={
                              question.type === "boolean"
                                ? t("common.yesNo")
                                : t("common.select")
                            }
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          {question.required && (
                            <Chip
                              label={t("common.required")}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {renderQuestionOptions(question)}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={isSelected}
                      onChange={() => handleToggleQuestion(question)}
                      disabled={updateEnabled.isPending || !canToggle}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}

            {/* Custom Questions */}
            {rsvpConfig?.customQuestions?.map((question) => {
              const isSelected = selectedQuestions.some(
                (q) => q.id === question.id
              );

              return (
                <ListItem key={question.id} divider>
                  <ListItemText
                    primary={question.questionText}
                    secondary={
                      <Box>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={t("common.custom")}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={
                              question.type === "boolean"
                                ? t("common.yesNo")
                                : t("common.select")
                            }
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          {question.required && (
                            <Chip
                              label={t("common.required")}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {renderQuestionOptions(question)}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={isSelected}
                      onChange={() => handleToggleQuestion(question)}
                      disabled={updateEnabled.isPending}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {updateEnabled.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t("userRsvp.form.updateError")}
          </Alert>
        )}
      </Paper>

      {/* Custom Question Dialog */}
      <CustomQuestionForm
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        onSubmit={handleAddCustomQuestion}
        newQuestion={newCustomQuestion}
        setNewQuestion={setNewCustomQuestion}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        submitting={addCustomQuestion.isPending}
      />
    </Box>
  );
};

export default RSVPFormBuilder;
