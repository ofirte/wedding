import React from "react";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";
import { RSVPQuestion } from "src/api/rsvp/rsvpQuestionsTypes";
import { useTranslation } from "src/localization/LocalizationContext";
import TrueFalseQuestion from "../rsvpGuestForm/TrueFalseQuestion";
import SelectQuestion from "../rsvp/rsvpFormManagement/SelectQuestion";
import isNil from "lodash/isNil";

interface RSVPFormQuestionCardProps {
  question: RSVPQuestion;
  questionNumber: number;
  value: any;
  isOpen: boolean;
  isClickable: boolean;
  onCardClick: () => void;
  onValueChange: (questionId: string, value: boolean | string) => void;
  onScrollToQuestions: () => void;
}

const RSVPFormQuestionCard: React.FC<RSVPFormQuestionCardProps> = ({
  question,
  questionNumber,
  value,
  isOpen,
  isClickable,
  onCardClick,
  onValueChange,
  onScrollToQuestions,
}) => {
  const { t } = useTranslation();
  const hasAnswer = !isNil(value) && value !== "";

  const getAnswerSummary = () => {
    if (!hasAnswer) return undefined;

    if (question.type === "boolean") {
      const trueOption = question.booleanOptions?.trueOption || t("common.yes");
      const falseOption =
        question.booleanOptions?.falseOption || t("common.no");
      return value ? trueOption : falseOption;
    }

    return value?.toString();
  };

  const handleCardClick = () => {
    if (isClickable && !isOpen) {
      onCardClick();
      setTimeout(() => onScrollToQuestions(), 100);
    }
  };

  const handleValueChange = (newValue: boolean | string) => {
    onValueChange(question.id, newValue);
  };

  const renderQuestionContent = () => {
    if (question.type === "boolean") {
      return (
        <TrueFalseQuestion
          question={question}
          value={value}
          onValueChange={handleValueChange}
        />
      );
    }

    if (question.type === "select" && question.options) {
      return (
        <SelectQuestion
          question={question}
          value={value}
          onValueChange={handleValueChange}
        />
      );
    }

    return null;
  };

  return (
    <Card
      elevation={isOpen ? 4 : 1}
      sx={{
        mb: 3,
        borderRadius: 3,
        background: isOpen ? "#FAFAFA" : "#F5F5F5",
        border: isOpen ? "2px solid #E0E0E0" : "1px solid #E0E0E0",
        transition: "all 0.3s ease",
        cursor: isClickable ? "pointer" : "default",
        "&:hover": isClickable
          ? { boxShadow: 3, transform: "translateY(-1px)" }
          : {},
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: !isOpen && hasAnswer ? 2 : 3 }}>
        {!isOpen ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              {question.questionText}
            </Typography>
            {hasAnswer && (
              <Chip
                label={getAnswerSummary()}
                sx={{
                  bgcolor: "#9BBB9B",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  mr: 1,
                }}
              />
            )}
          </Box>
        ) : (
          // Full question view
          renderQuestionContent()
        )}
      </CardContent>
    </Card>
  );
};

export default RSVPFormQuestionCard;
