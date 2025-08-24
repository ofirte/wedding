import React, { useRef } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { RSVPFormData } from "./guestRSVPTypes";
import { Invitee } from "../invitees/InviteList";
import AttendanceQuestion from "./questions/AttendanceQuestion";
import GuestCountQuestion from "./questions/GuestCountQuestion";
import SleepoverQuestion from "./questions/SleepoverQuestion";
import RideQuestion from "./questions/RideQuestion";

interface RSVPQuestionsFormProps {
  guestInfo: Invitee;
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}

const RSVPQuestionsForm: React.FC<RSVPQuestionsFormProps> = ({
  guestInfo,
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  error,
}) => {
  const questionsRef = useRef<HTMLDivElement>(null);

  // Determine which step should be currently active (open)
  const getCurrentStep = () => {
    if (formData.attending === "") return 1; // First question
    if (formData.attending === "no") return 0; // All done if not attending

    // For attending users, show next unanswered question
    if (formData.attending === "yes") {
      if (formData.guestCount === 0) return 2; // Second question
      if (formData.sleepover === "") return 3; // Third question
      if (formData.needsRideFromTelAviv === "") return 4; // Fourth question
    }

    return 0; // All done
  };

  const currentStep = getCurrentStep();

  // Scroll to questions section when moving to next step
  const scrollToQuestions = () => {
    if (questionsRef.current) {
      questionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  // Handle clicking on collapsed questions to reopen them
  const handleQuestionClick = (questionNumber: number) => {
    // Only allow reopening if not the current step
    if (questionNumber !== currentStep && completedSteps >= questionNumber) {
      // Only reset the specific answer being edited - preserve other answers
      switch (questionNumber) {
        case 1:
          // For attendance question, only reset attendance itself
          // Other answers will be handled by the handleAttendingChange logic if needed
          onFormDataChange({
            attending: "",
          });
          break;
        case 2:
          // Reset only guest count, preserve sleepover and ride answers
          onFormDataChange({
            guestCount: 0,
          });
          break;
        case 3:
          // Reset only sleepover, preserve ride answer
          onFormDataChange({
            sleepover: "",
          });
          break;
        case 4:
          // Reset only ride question
          onFormDataChange({
            needsRideFromTelAviv: "",
          });
          break;
      }
      // Scroll to the question after a brief delay
      setTimeout(() => scrollToQuestions(), 100);
    }
  };

  // Helper function to determine if a question should be clickable
  const isQuestionClickable = (questionNumber: number) => {
    // Allow clicking on completed questions to reopen them
    return completedSteps >= questionNumber && questionNumber !== currentStep;
  };

  const isAttending = formData.attending === "yes";

  const completedSteps = [
    formData.attending !== "",
    isAttending ? formData.guestCount > 0 : formData.attending === "no",
    isAttending ? formData.sleepover !== "" : formData.attending === "no",
    isAttending
      ? formData.needsRideFromTelAviv !== ""
      : formData.attending === "no",
  ].filter(Boolean).length;

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
            (completedSteps / 4) * 100
          }%, #E8E0CC ${(completedSteps / 4) * 100}%)`,
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
        🎉 אישור הגעה 🎉
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "#666666", mb: 4, textAlign: "center" }}
      >
        {guestInfo.name} יקר/ה
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: "#888888", textAlign: "center", mb: 2 }}
        >
          {completedSteps}/4 שלבים הושלמו
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
              width: `${(completedSteps / 4) * 100}%`,
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

      <Box component="form" onSubmit={onSubmit} ref={questionsRef}>
        <AttendanceQuestion
          formData={formData}
          onFormDataChange={onFormDataChange}
          currentStep={currentStep}
          isClickable={isQuestionClickable(1)}
          onQuestionClick={() => handleQuestionClick(1)}
          onScroll={scrollToQuestions}
        />

        <GuestCountQuestion
          formData={formData}
          onFormDataChange={onFormDataChange}
          currentStep={currentStep}
          isClickable={isQuestionClickable(2)}
          onQuestionClick={() => handleQuestionClick(2)}
          onScroll={scrollToQuestions}
        />

        <SleepoverQuestion
          formData={formData}
          onFormDataChange={onFormDataChange}
          currentStep={currentStep}
          isClickable={isQuestionClickable(3)}
          onQuestionClick={() => handleQuestionClick(3)}
          onScroll={scrollToQuestions}
        />

        <RideQuestion
          formData={formData}
          onFormDataChange={onFormDataChange}
          currentStep={currentStep}
          isClickable={isQuestionClickable(4)}
          onQuestionClick={() => handleQuestionClick(4)}
          onScroll={scrollToQuestions}
        />

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || completedSteps < 4}
            sx={{
              bgcolor: completedSteps === 4 ? "#4A6741" : "#CCCCCC",
              color: "white",
              px: 8,
              py: 2,
              borderRadius: 4,
              fontSize: "1.3rem",
              fontWeight: "bold",
              boxShadow:
                completedSteps === 4
                  ? "0 8px 20px rgba(74, 103, 65, 0.4)"
                  : "none",
              transform: completedSteps === 4 ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: completedSteps === 4 ? "#3A5232" : "#CCCCCC",
                transform: completedSteps === 4 ? "scale(1.08)" : "scale(1)",
              },
              "&:disabled": {
                color: "#999999",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: "white" }} />
                שולח...
              </>
            ) : completedSteps === 4 ? (
              "🎉 שלח אישור הגעה! 🎉"
            ) : (
              `מלא את כל השאלות (${completedSteps}/4)`
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RSVPQuestionsForm;