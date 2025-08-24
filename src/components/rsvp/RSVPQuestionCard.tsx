import React from "react";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";
import { RSVPFormData } from "./guestRSVPTypes";

interface RSVPQuestionCardProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  isOpen: boolean;
  isClickable: boolean;
  onScroll: () => void;
  onQuestionClick?: () => void;
  questionComponent: React.ReactNode;
  questionTitle: string;
  answerSummary?: string;
}

const RSVPQuestionCard: React.FC<RSVPQuestionCardProps> = ({
  formData,
  onFormDataChange,
  isOpen,
  isClickable,
  onScroll,
  onQuestionClick,
  questionComponent,
  questionTitle,
  answerSummary,
}) => {
  const handleCardClick = () => {
    if (isClickable && !isOpen && onQuestionClick) {
      console.log("here");
      onQuestionClick();
      setTimeout(() => onScroll(), 100);
    }
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
        transform: "scale(1)",
        opacity: 1,
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: !isOpen && answerSummary ? 2 : 3 }}>
        {!isOpen ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              {questionTitle}
            </Typography>
            {answerSummary && (
              <Chip
                label={answerSummary}
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
          // Full question view - render the actual question component
          questionComponent
        )}
      </CardContent>
    </Card>
  );
};

export default RSVPQuestionCard;
