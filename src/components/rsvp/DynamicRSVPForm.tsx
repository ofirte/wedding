import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

import { InviteeRSVP, RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import RSVPFormQuestionCard from "./RSVPFormQuestionCard";
import { useTranslation } from "../../localization/LocalizationContext";
import isNil from "lodash/isNil";

interface DynamicRSVPFormProps {
  guestName: string;
  questions: RSVPQuestion[];
  initialData?: Partial<InviteeRSVP>;
  onSubmit: (data: InviteeRSVP) => void;
  onFormDataChange?: (data: Partial<InviteeRSVP>) => void;
  submitting: boolean;
  error: string | null;
  isSubmitted: boolean;
}

const DynamicRSVPForm: React.FC<DynamicRSVPFormProps> = ({
  guestName,
  questions,
  initialData = {},
  onSubmit,
  onFormDataChange,
  submitting,
  error,
  isSubmitted,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const questionsRef = useRef<HTMLDivElement>(null);

  // Simple helper functions like the original
  const getNextUnansweredQuestion = (data: Record<string, any>) => {
    // Get currently visible questions based on attendance
    const currentlyVisible = questions.filter((question, index) => {
      // Always show first question (attendance)
      if (index === 0) return true;

      // If user answered "no" to attendance, hide other questions
      const attendanceQuestion = questions[0];
      const attendanceAnswer = data[attendanceQuestion?.id];
      if (attendanceAnswer === false) {
        return false;
      }

      return true;
    });

    for (let i = 0; i < currentlyVisible.length; i++) {
      const question = currentlyVisible[i];
      const value = data[question.id];
      if (isNil(value) || value === "") {
        // Find the original index in the full questions array
        const originalIndex = questions.findIndex((q) => q.id === question.id);
        return originalIndex + 1; // Return 1-based index like original
      }
    }
    return null;
  };

  // Get visible questions based on attendance answer
  const visibleQuestions = questions.filter((question, index) => {
    // Always show attendance question (should be first)
    if (question.id === "attendance") return true;

    // For all other questions, show only if attendance is true
    const attendanceQuestion = questions.find((q) => q.id === "attendance");
    if (!attendanceQuestion) return true; // Fallback: show if no attendance question
    const attendanceAnswer = formData[attendanceQuestion.id];
    if (attendanceAnswer === false) {
      return false;
    }

    return true;
  });

  const numberOfAnsweredQuestions = visibleQuestions.filter((question) => {
    const value = formData[question.id];
    return !isNil(value) && value !== "";
  }).length;

  const [currentOpenQuestion, setCurrentOpenQuestion] = useState<number>(1);

  // Memoized filtered initial data to prevent unnecessary re-renders
  const filteredInitialData = useMemo(() => {
    if (!initialData || questions.length === 0) {
      return {};
    }

    const filteredData: Record<string, any> = {};

    // Always preserve system fields
    if (initialData.isSubmitted !== undefined) {
      filteredData.isSubmitted = initialData.isSubmitted;
    }
    if (initialData.submittedAt !== undefined) {
      filteredData.submittedAt = initialData.submittedAt;
    }

    // Only include answers for questions that are currently in the config
    const currentQuestionIds = questions.map((q) => q.id);
    currentQuestionIds.forEach((questionId) => {
      if (initialData[questionId] !== undefined) {
        filteredData[questionId] = initialData[questionId];
      }
    });

    return filteredData;
  }, [initialData, questions]);

  // Initialize form data only when filtered data actually changes
  useEffect(() => {
    setFormData((prevData) => {
      // Check if data actually changed to prevent unnecessary updates
      const dataChanged =
        JSON.stringify(prevData) !== JSON.stringify(filteredInitialData);
      return dataChanged ? filteredInitialData : prevData;
    });
  }, [filteredInitialData]);

  const handleFormDataChange = (newFormData: Partial<Record<string, any>>) => {
    let updatedFormData = { ...formData, ...newFormData };

    // Handle attendance selection like the original
    const attendanceQuestionId = questions[0]?.id;
    if (attendanceQuestionId && newFormData[attendanceQuestionId] === false) {
      // When selecting "no" to attendance, clear other answers
      updatedFormData = { [attendanceQuestionId]: false, formData };
    }

    // Call auto-save callback if provided FIRST, like the original
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }

    // Update local state
    setFormData(updatedFormData);

    // Auto-advance to next question like the original
    const nextQuestion = getNextUnansweredQuestion(updatedFormData);
    if (nextQuestion) {
      setCurrentOpenQuestion(nextQuestion);
    } else {
      // All questions answered, close all
      setCurrentOpenQuestion(0);
    }
  };

  const handleQuestionClick = (questionNumber: number) => {
    setCurrentOpenQuestion(questionNumber);
  };

  const scrollToQuestions = () => {
    if (questionsRef.current) {
      questionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const validateForm = (): boolean => {
    // Check if all visible required questions are answered
    const requiredVisibleQuestions = visibleQuestions.filter(
      (q: RSVPQuestion) => q.required
    );

    for (const question of requiredVisibleQuestions) {
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

  const handleQuestionValueChange = (
    questionId: string,
    value: boolean | string
  ) => {
    handleFormDataChange({ [questionId]: value });
  };

  const renderQuestionCard = (question: RSVPQuestion, index: number) => {
    const questionNumber = index + 1;
    const isOpen = currentOpenQuestion === questionNumber;
    const isClickable = currentOpenQuestion !== questionNumber;

    return (
      <RSVPFormQuestionCard
        key={question.id}
        question={question}
        questionNumber={questionNumber}
        value={formData[question.id]}
        isOpen={isOpen}
        isClickable={isClickable}
        onCardClick={() => handleQuestionClick(questionNumber)}
        onValueChange={handleQuestionValueChange}
        onScrollToQuestions={scrollToQuestions}
      />
    );
  };

  const isValid = validateForm();
  const isDone = isValid;

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
        direction: "rtl",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, #9BBB9B ${
            (numberOfAnsweredQuestions / visibleQuestions.length) * 100
          }%, #E8E0CC ${
            (numberOfAnsweredQuestions / visibleQuestions.length) * 100
          }%)`,
          transition: "all 0.3s ease",
        },
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
        {guestName}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: "#888888", textAlign: "center", mb: 2 }}
        >
          {t("rsvp.stepsCompleted", {
            completed: numberOfAnsweredQuestions,
            total: visibleQuestions.length,
          })}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 8,
            backgroundColor: "#E8E0CC",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${
                (numberOfAnsweredQuestions / visibleQuestions.length) * 100
              }%`,
              height: "100%",
              backgroundColor: "#9BBB9B",
              transition: "width 0.5s ease",
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, direction: "rtl" }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} ref={questionsRef}>
        {visibleQuestions.map((question, index) =>
          renderQuestionCard(
            question,
            questions.findIndex((q) => q.id === question.id)
          )
        )}

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !isDone}
            sx={{
              bgcolor: isDone ? "#4A6741" : "#CCCCCC",
              color: "white",
              px: 8,
              py: 2,
              borderRadius: 4,
              fontSize: "1.3rem",
              fontWeight: "bold",
              boxShadow: isDone ? "0 8px 20px rgba(74, 103, 65, 0.4)" : "none",
              transform: isDone ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: isDone ? "#3A5232" : "#CCCCCC",
                transform: isDone ? "scale(1.08)" : "scale(1)",
              },
              "&:disabled": {
                color: "#999999",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: "white" }} />
                {isSubmitted ? t("rsvp.updating") : t("rsvp.sending")}
              </>
            ) : isDone ? (
              isSubmitted ? (
                `🔄 ${t("rsvp.updateConfirmation")} 🔄`
              ) : (
                `🎉 ${t("rsvp.sendConfirmation")} 🎉`
              )
            ) : (
              t("rsvp.completeAllQuestions", {
                completed: numberOfAnsweredQuestions,
                total: visibleQuestions.length,
              })
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DynamicRSVPForm;
