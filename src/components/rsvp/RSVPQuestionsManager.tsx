import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  useRSVPConfig,
  useRSVPFormQuestions,
  useCreateDefaultRSVPConfig,
  useAddCustomQuestion,
  useUpdateEnabledQuestions,
} from "../../hooks/rsvp/useRSVPQuestions";
import {
  getPredefinedQuestions,
  RSVPQuestion,
} from "../../api/rsvp/rsvpQuestionsTypes";
import { useLocalization } from "../../localization/LocalizationContext";
import CustomQuestionForm from "./CustomQuestionForm";
import QuestionBankModal from "./QuestionBankModal";
import RSVPFormEmptyState from "./RSVPFormEmptyState";

const RSVPQuestionsManager: React.FC = () => {
  const { t } = useLocalization();
  const { data: config, isLoading } = useRSVPConfig();
  const { questions: enabledQuestions } = useRSVPFormQuestions();
  const createDefaultConfig = useCreateDefaultRSVPConfig();
  const updateEnabled = useUpdateEnabledQuestions();
  const addCustom = useAddCustomQuestion();

  // Get translated predefined questions
  const PREDEFINED_QUESTIONS = useMemo(() => getPredefinedQuestions(t), [t]);

  // State management
  const [selectedQuestions, setSelectedQuestions] = useState<RSVPQuestion[]>(
    []
  );
  const [customQuestions, setCustomQuestions] = useState<RSVPQuestion[]>([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    displayName: "",
    type: "boolean" as "boolean" | "select",
    options: ["", ""],
    booleanOptions: {
      trueOption: "",
      falseOption: "",
    },
  });

  // No automatic config creation - user must explicitly create
  useEffect(() => {
    if (config) {
      // Use enabledQuestions from the hook for consistency
      setSelectedQuestions(enabledQuestions);
      setCustomQuestions(config.customQuestions || []);
    }
  }, [config, enabledQuestions]);

  // Handlers
  const handleAddFromBank = async (question: RSVPQuestion) => {
    if (
      !selectedQuestions.find((q) => q.id === question.id) &&
      config?.weddingId
    ) {
      const newSelectedQuestions = [...selectedQuestions, question];
      setSelectedQuestions(newSelectedQuestions);

      // Auto-save immediately
      try {
        const enabledIds = newSelectedQuestions.map((q) => q.id);
        await updateEnabled.mutateAsync({
          enabledQuestionIds: enabledIds,
        });
      } catch (error) {
        console.error("Error auto-saving question:", error);
        // Revert on error
        setSelectedQuestions((prev) =>
          prev.filter((q) => q.id !== question.id)
        );
      }
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (config?.weddingId) {
      const newSelectedQuestions = selectedQuestions.filter(
        (q) => q.id !== questionId
      );
      setSelectedQuestions(newSelectedQuestions);

      // Auto-save immediately
      try {
        const enabledIds = newSelectedQuestions.map((q) => q.id);
        await updateEnabled.mutateAsync({
          enabledQuestionIds: enabledIds,
        });
      } catch (error) {
        console.error("Error auto-saving after removal:", error);
        // Revert on error
        setSelectedQuestions((prev) => [
          ...prev,
          selectedQuestions.find((q) => q.id === questionId)!,
        ]);
      }
    }
  };

  const handleCreateCustomQuestion = async () => {
    if (
      !config?.weddingId ||
      !newQuestion.text.trim() ||
      !newQuestion.displayName.trim() ||
      (newQuestion.type === "boolean" &&
        (!newQuestion.booleanOptions.trueOption.trim() ||
          !newQuestion.booleanOptions.falseOption.trim()))
    )
      return;

    try {
      const questionToAdd = {
        questionText: newQuestion.text.trim(),
        displayName: newQuestion.displayName.trim(),
        type: newQuestion.type,
        required: false,
        ...(newQuestion.type === "select" && {
          options: newQuestion.options.filter((opt) => opt.trim() !== ""),
        }),
        ...(newQuestion.type === "boolean" && {
          booleanOptions: {
            trueOption: newQuestion.booleanOptions.trueOption.trim(),
            falseOption: newQuestion.booleanOptions.falseOption.trim(),
          },
        }),
      };

      await addCustom.mutateAsync({
        weddingId: config.weddingId,
        question: questionToAdd,
      });

      // Reset form and close
      setNewQuestion({
        text: "",
        displayName: "",
        type: "boolean",
        options: ["", ""],
        booleanOptions: {
          trueOption: "",
          falseOption: "",
        },
      });
      setIsCustomFormOpen(false);
    } catch (error) {
      console.error("Error creating custom question:", error);
    }
  };

  const addOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 2) {
      setNewQuestion((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const getAvailableQuestions = () => {
    const allQuestions = [...PREDEFINED_QUESTIONS, ...customQuestions];
    return allQuestions.filter(
      (q) => !selectedQuestions.find((sq) => sq.id === q.id)
    );
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Show empty state if no config exists
  if (!config && !isLoading) {
    return (
      <RSVPFormEmptyState
        onCreateForm={() => createDefaultConfig.mutate()}
        isCreating={createDefaultConfig.isPending}
      />
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4, position: "relative" }}>
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#111827"
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            RSVP Form Builder
          </Typography>
          <Typography
            variant="body1"
            color="#6b7280"
            sx={{ maxWidth: 500, mx: "auto", lineHeight: 1.6 }}
          >
            Build your perfect RSVP form by selecting and organizing questions
          </Typography>
        </Box>

        {/* Selected Questions Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
          >
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  Your RSVP Form
                </Typography>
                <Tooltip
                  title={`Add Questions (${
                    getAvailableQuestions().length
                  } available)`}
                  placement="top"
                  arrow
                >
                  <IconButton
                    color="primary"
                    onClick={() => setIsQuestionBankOpen(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      width: 36,
                      height: 36,
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="#6b7280">
                {selectedQuestions.length} questions selected • Click + to add
                more
              </Typography>
            </Box>
          </Box>

          {selectedQuestions.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                borderRadius: 2,
                border: "2px dashed #d1d5db",
                backgroundColor: "#f9fafb",
              }}
            >
              <Typography variant="h6" color="#6b7280" gutterBottom>
                No questions selected
              </Typography>
              <Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
                Choose questions from the available options above to build your
                RSVP form
              </Typography>
            </Box>
          ) : (
            <Box>
              {selectedQuestions.map((question, index) => (
                <Box
                  key={question.id}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box flex={1}>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color="#111827"
                        gutterBottom
                      >
                        {question.questionText}
                      </Typography>
                      {question.displayName && (
                        <Typography
                          variant="caption"
                          color="#6b7280"
                          sx={{ mb: 1, display: "block" }}
                        >
                          Table column: {question.displayName}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor:
                            question.type === "boolean" ? "#dbeafe" : "#fef3c7",
                          color:
                            question.type === "boolean" ? "#1d4ed8" : "#92400e",
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: 500,
                        }}
                      >
                        {question.type === "boolean"
                          ? "Yes/No Question"
                          : "Multiple Choice"}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveQuestion(question.id)}
                      sx={{
                        color: "#6b7280",
                        "&:hover": {
                          color: "#ef4444",
                          backgroundColor: "#fef2f2",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Question Bank Modal */}
      <QuestionBankModal
        open={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAddQuestion={handleAddFromBank}
        onCreateCustomQuestion={() => {
          handleCreateCustomQuestion();
          setIsQuestionBankOpen(false);
        }}
        predefinedQuestions={PREDEFINED_QUESTIONS.filter(
          (q) => !selectedQuestions.find((sq) => sq.id === q.id)
        )}
        customQuestions={customQuestions.filter(
          (q) => !selectedQuestions.find((sq) => sq.id === q.id)
        )}
        selectedQuestionIds={selectedQuestions.map((q) => q.id)}
        isCustomFormOpen={isCustomFormOpen}
        setIsCustomFormOpen={setIsCustomFormOpen}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        submitting={addCustom.isPending}
      />

      {/* Custom Question Form Dialog */}
      <CustomQuestionForm
        open={isCustomFormOpen}
        onClose={() => setIsCustomFormOpen(false)}
        onSubmit={handleCreateCustomQuestion}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        submitting={addCustom.isPending}
      />
    </Box>
  );
};

export default RSVPQuestionsManager;
