import React, { useRef, useState, useEffect, useMemo } from "react";
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
import RSVPQuestionCard from "./RSVPQuestionCard";
import AttendanceQuestion from "./questions/AttendanceQuestion";
import GuestCountQuestion from "./questions/GuestCountQuestion";
import SleepoverQuestion from "./questions/SleepoverQuestion";
import RideQuestion from "./questions/RideQuestion";
import { isNil } from "lodash";

interface RSVPQuestionsFormProps {
  guestInfo: Invitee;
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
  isSubmitted: boolean;
}

const RSVPQuestionsForm: React.FC<RSVPQuestionsFormProps> = ({
  guestInfo,
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  error,
  isSubmitted,
}) => {
  const getNextUnansweredQuestion = (newFormData: Partial<RSVPFormData>) => {
    if (isNil(newFormData.attending)) return 1;
    if (isNil(newFormData.guestCount) || newFormData.guestCount === 0) return 2;
    if (isNil(newFormData.sleepover)) return 3;
    if (isNil(newFormData.needsRideFromTelAviv)) return 4;
    return null;
  };
  const questionsRef = useRef<HTMLDivElement>(null);
  const firstUnansweredQuestion = useMemo(
    () => getNextUnansweredQuestion(formData),
    [formData]
  );
  const [currentOpenQuestion, setCurrentOpenQuestion] = useState<number>(
    firstUnansweredQuestion || 0
  );
  const isDone =
    (formData.attending === "yes" &&
      !!formData.guestCount &&
      !!formData.sleepover &&
      formData.needsRideFromTelAviv) ||
    formData.attending === "no";
  const numberOfAnsweredQuestions = Object.values(formData).filter(
    (value) => !isNil(value) && value !== 0
  ).length;

  const numberOfQuestionsNeeded =
    formData.attending === "no" ? 1 : formData.sleepover === "no" ? 4 : 3;
  // Handle form data changes
  const handleFormDataChange = (newFormData: Partial<RSVPFormData>) => {
    onFormDataChange(newFormData);
    const nextQuestion = getNextUnansweredQuestion({
      ...formData,
      ...newFormData,
    });
    if (nextQuestion) {
      setCurrentOpenQuestion(nextQuestion);
    } else {
      setCurrentOpenQuestion(0);
    }
  };

  // Handle clicking on completed questions to reopen them
  const handleQuestionClick = (questionNumber: number) => {
    setCurrentOpenQuestion(questionNumber);
  };

  // Scroll to questions
  const scrollToQuestions = () => {
    if (questionsRef.current) {
      questionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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
            (numberOfAnsweredQuestions / numberOfQuestionsNeeded) * 100
          }%, #E8E0CC ${
            (numberOfAnsweredQuestions / numberOfQuestionsNeeded) * 100
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
          {numberOfAnsweredQuestions}/{numberOfQuestionsNeeded} שלבים הושלמו
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
                (numberOfAnsweredQuestions / numberOfQuestionsNeeded) * 100
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

      <Box component="form" onSubmit={onSubmit} ref={questionsRef}>
        <RSVPQuestionCard
          formData={formData}
          onFormDataChange={handleFormDataChange}
          isOpen={currentOpenQuestion === 1}
          isClickable={currentOpenQuestion !== 1}
          onScroll={scrollToQuestions}
          onQuestionClick={() => handleQuestionClick(1)}
          questionTitle="💒 האם תגיעו לחתונה?"
          answerSummary={
            formData.attending === "yes"
              ? "🎊 כן, נגיע!"
              : formData.attending === "no"
              ? "😔 לא נוכל להגיע"
              : undefined
          }
          questionComponent={
            <AttendanceQuestion
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onScroll={scrollToQuestions}
            />
          }
        />

        {formData.attending === "yes" && (
          <>
            <RSVPQuestionCard
              formData={formData}
              onFormDataChange={handleFormDataChange}
              isOpen={currentOpenQuestion === 2}
              isClickable={currentOpenQuestion !== 2}
              onScroll={scrollToQuestions}
              onQuestionClick={() => handleQuestionClick(2)}
              questionTitle="👥 כמה אנשים תביאו?"
              answerSummary={
                formData.guestCount && formData.guestCount > 0
                  ? `${formData.guestCount} אנשים`
                  : undefined
              }
              questionComponent={
                <GuestCountQuestion
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onScroll={scrollToQuestions}
                />
              }
            />

            <RSVPQuestionCard
              formData={formData}
              onFormDataChange={handleFormDataChange}
              isOpen={currentOpenQuestion === 3}
              isClickable={currentOpenQuestion !== 3}
              onScroll={scrollToQuestions}
              onQuestionClick={() => handleQuestionClick(3)}
              questionTitle="🛏️ לינה במקום?"
              answerSummary={
                formData.sleepover === "yes"
                  ? "כן, נישאר ללון"
                  : formData.sleepover === "no"
                  ? "לא, נחזור הביתה"
                  : undefined
              }
              questionComponent={
                <SleepoverQuestion
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onScroll={scrollToQuestions}
                />
              }
            />

            {formData.sleepover === "no" && (
              <RSVPQuestionCard
                formData={formData}
                onFormDataChange={handleFormDataChange}
                isOpen={currentOpenQuestion === 4}
                isClickable={currentOpenQuestion !== 4}
                onScroll={scrollToQuestions}
                onQuestionClick={() => handleQuestionClick(4)}
                questionTitle="🚗 צריכים הסעה מתל אביב?"
                answerSummary={
                  formData.needsRideFromTelAviv === "yes"
                    ? "כן, נזדקק להסעה"
                    : formData.needsRideFromTelAviv === "no"
                    ? "לא, נגיע בכוחות עצמנו"
                    : undefined
                }
                questionComponent={
                  <RideQuestion
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onScroll={scrollToQuestions}
                  />
                }
              />
            )}
          </>
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
                {isSubmitted ? "מעדכן..." : "שולח..."}
              </>
            ) : isDone ? (
              isSubmitted ? (
                "🔄 עדכן אישור הגעה 🔄"
              ) : (
                "🎉 שלח אישור הגעה! 🎉"
              )
            ) : (
              `מלא את כל השאלות (${numberOfAnsweredQuestions}/${numberOfQuestionsNeeded})`
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RSVPQuestionsForm;
