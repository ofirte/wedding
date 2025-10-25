import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,

  IconButton,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useRSVPConfig } from "src/hooks/rsvp";
import { useUpdateEnabledQuestions } from "../../../hooks/rsvp/useUpdateEnabledQuestions";
import { useTranslation } from "src/localization/LocalizationContext";
import { getPredefinedQuestions } from "src/api/rsvp/rsvpQuestionsTypes";

const QuestionsList: React.FC = () => {
  const { data: rsvpConfig } = useRSVPConfig();
  const { t } = useTranslation();
  const questionBank = getPredefinedQuestions(t);
  const { mutate: updateEnabledQuestions } = useUpdateEnabledQuestions();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const usedQuestions = rsvpConfig?.enabledQuestionIds || [];
  const questionsToRender = useMemo(() => {
    return [...questionBank, ...(rsvpConfig?.customQuestions ?? [])].filter(
      (q) => !q.required && !usedQuestions.includes(q.id)
    );
  }, [questionBank, rsvpConfig?.customQuestions, usedQuestions]);

  const handleAddQuestion = (questionId: string) => {
    if (!rsvpConfig?.enabledQuestionIds) return;

    const updatedQuestionIds = [...rsvpConfig.enabledQuestionIds, questionId];
    updateEnabledQuestions(updatedQuestionIds);
  };


  return (
    <Box sx={{ p: 2 }}>
      {questionsToRender.map((question) => (
        <Card
          key={question.id}
          onMouseEnter={() => setHoveredCard(question.id)}
          onMouseLeave={() => setHoveredCard(null)}
          sx={{
            mb: 2,
            cursor: "pointer",
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 3,
            transition: "all 0.2s ease-in-out",
            position: "relative",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: 1,
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{ flexGrow: 1, pr: 1 }}
              >
                {question.questionText}
              </Typography>

              {/* Plus Icon - Only show on hover */}
              {hoveredCard === question.id && (
                <IconButton
                  size="small"
                  onClick={() => handleAddQuestion(question.id)}
                  sx={{
                    position: "absolute",
                    top: 24,
                    right: 8,
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                {question.type === "boolean"
                  ? "Yes/No"
                  : question.type === "select"
                  ? `${question.options?.length || 0} options`
                  : question.type}
              </Typography>

              {question.required && (
                <Chip
                  label="Required"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ fontSize: "0.6rem", height: 20 }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default QuestionsList;
