import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useAvailableQuestions } from "../../hooks/rsvp/useRSVPQuestions";
import { InviteeRSVP, RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import { useTranslation } from "../../localization/LocalizationContext";

interface DynamicRSVPFormProps {
  guestName: string;
  initialData?: Partial<InviteeRSVP>;
  onSubmit: (data: InviteeRSVP) => void;
  submitting: boolean;
  error: string | null;
  isSubmitted: boolean;
}

const DynamicRSVPForm: React.FC<DynamicRSVPFormProps> = ({
  guestName,
  initialData = {},
  onSubmit,
  submitting,
  error,
  isSubmitted,
}) => {
  const { t } = useTranslation();
  const { questions, isLoading: isLoadingQuestions } = useAvailableQuestions();
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFieldChange = (questionId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateForm = (): boolean => {
    // Check if all required questions are answered
    const requiredQuestions = questions.filter((q: RSVPQuestion) => q.required);

    for (const question of requiredQuestions) {
      const value = formData[question.id];
      if (value === undefined || value === null || value === "") {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const rsvpData: InviteeRSVP = {
      ...formData,
      isSubmitted: true,
      submittedAt: new Date(),
    };

    onSubmit(rsvpData);
  };

  const renderQuestion = (question: RSVPQuestion) => {
    const value = formData[question.id];

    if (question.type === "boolean") {
      return (
        <FormControl
          key={question.id}
          component="fieldset"
          sx={{ mb: 4, width: "100%" }}
          required={question.required}
        >
          <FormLabel
            component="legend"
            sx={{ mb: 2, fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {question.questionText} {question.required && "*"}
          </FormLabel>
          <RadioGroup
            value={value === undefined ? "" : value.toString()}
            onChange={(e) =>
              handleFieldChange(question.id, e.target.value === "true")
            }
            row
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={question.booleanOptions?.trueOption || t("common.yes")}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={question.booleanOptions?.falseOption || t("common.no")}
            />
          </RadioGroup>
        </FormControl>
      );
    }

    if (question.type === "select" && question.options) {
      return (
        <FormControl
          key={question.id}
          sx={{ mb: 4, minWidth: 250 }}
          required={question.required}
        >
          <InputLabel>
            {question.questionText} {question.required && "*"}
          </InputLabel>
          <Select
            value={value || ""}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            label={question.questionText}
          >
            {question.options.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          {question.required && !value && (
            <FormHelperText error>{t("common.fieldRequired")}</FormHelperText>
          )}
        </FormControl>
      );
    }

    return null;
  };

  if (isLoadingQuestions) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isValid = validateForm();
  const attendingQuestion = questions.find(
    (q: RSVPQuestion) => q.id === "attendance"
  );
  const isAttending = formData["attendance"];

  // If attendance is false, we might want to show only that question or a subset
  const questionsToShow =
    attendingQuestion && isAttending === false
      ? [attendingQuestion]
      : questions;

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#333333",
          mb: 1,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        🎉 RSVP 🎉
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "#666666", mb: 4, textAlign: "center" }}
      >
        {t("common.dear")} {guestName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {questionsToShow.map(renderQuestion)}

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !isValid}
            sx={{
              bgcolor: isValid ? "#4A6741" : "#CCCCCC",
              color: "white",
              px: 6,
              py: 2,
              borderRadius: 4,
              fontSize: "1.2rem",
              fontWeight: "bold",
              boxShadow: isValid ? "0 8px 20px rgba(74, 103, 65, 0.4)" : "none",
              transform: isValid ? "scale(1.02)" : "scale(1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: isValid ? "#3A5232" : "#CCCCCC",
                transform: isValid ? "scale(1.05)" : "scale(1)",
              },
              "&:disabled": {
                color: "#999999",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: "white" }} />
                {isSubmitted ? t("common.updating") : t("common.submitting")}
              </>
            ) : isValid ? (
              isSubmitted ? (
                t("common.updateRSVP")
              ) : (
                t("common.submitRSVP")
              )
            ) : (
              t("common.completeRequiredFields")
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DynamicRSVPForm;
