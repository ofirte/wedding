import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Collapse,
  Divider,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  RadioButtonChecked as BooleanIcon,
  List as SelectIcon,
} from "@mui/icons-material";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";

interface QuestionSidebarProps {
  predefinedQuestions: RSVPQuestion[];
  customQuestions: RSVPQuestion[];
  selectedQuestionIds: string[];
  onAddQuestion: (question: RSVPQuestion) => void;
  onCreateCustom: () => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  predefinedQuestions,
  customQuestions,
  selectedQuestionIds,
  onAddQuestion,
  onCreateCustom,
}) => {
  const [predefinedExpanded, setPredefinedExpanded] = useState(true);
  const [customExpanded, setCustomExpanded] = useState(true);

  const availablePredefined = predefinedQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const availableCustom = customQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const getTypeIcon = (type: string) => {
    return type === "boolean" ? (
      <BooleanIcon sx={{ fontSize: 18, color: "rgba(79, 172, 254, 0.9)" }} />
    ) : (
      <SelectIcon sx={{ fontSize: 18, color: "rgba(250, 112, 154, 0.9)" }} />
    );
  };

  const QuestionSidebarCard = ({ question }: { question: RSVPQuestion }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Box
        sx={{
          mb: 2,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onAddQuestion(question)}
      >
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            backgroundColor: isHovered ? "#f9fafb" : "#ffffff",
            boxShadow: isHovered
              ? "0 4px 12px rgba(0, 0, 0, 0.1)"
              : "0 1px 3px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                backgroundColor:
                  question.type === "boolean" ? "#dbeafe" : "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getTypeIcon(question.type)}
            </Box>
            <Box flex={1}>
              <Typography
                variant="caption"
                sx={{
                  color: "#6b7280",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.7rem",
                }}
              >
                {question.type === "boolean" ? "Yes/No" : "Multiple Choice"}
              </Typography>
            </Box>
            {question.required && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                }}
              />
            )}
          </Box>

          {/* Question Text */}
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              color: "#111827",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {question.questionText}
          </Typography>

          {/* Display Name */}
          {question.displayName && (
            <Box
              sx={{
                backgroundColor: "#f3f4f6",
                borderRadius: 1,
                px: 2,
                py: 0.75,
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Table: {question.displayName}
              </Typography>
            </Box>
          )}

          {/* Add Button */}
          <Button
            size="small"
            startIcon={<AddIcon />}
            fullWidth
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              py: 1,
              backgroundColor: isHovered ? "#3b82f6" : "#f3f4f6",
              color: isHovered ? "white" : "#6b7280",
              border: "none",
              "&:hover": {
                backgroundColor: "#3b82f6",
                color: "white",
              },
            }}
          >
            Add Question
          </Button>
        </Box>
      </Box>
    );
  };

  const SectionHeader = ({
    title,
    count,
    expanded,
    onToggle,
  }: {
    title: string;
    count: number;
    expanded: boolean;
    onToggle: () => void;
  }) => (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        p: 2,
        mb: 2,
        borderRadius: 1.5,
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#f3f4f6",
        },
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="#111827"
          sx={{ mb: 0.25 }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="#6b7280"
          sx={{ fontSize: "0.75rem" }}
        >
          {count} available
        </Typography>
      </Box>
      <Box
        sx={{
          color: "#6b7280",
          transition: "transform 0.2s ease",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <ExpandMoreIcon fontSize="small" />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: 340,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #f3f4f6",
          backgroundColor: "#fafafa",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="#111827"
          sx={{ mb: 1 }}
        >
          Question Bank
        </Typography>
        <Typography
          variant="body2"
          color="#6b7280"
          sx={{ fontSize: "0.875rem", lineHeight: 1.5 }}
        >
          Click any question to add it to your form
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
        }}
      >
        {/* Predefined Questions */}
        <Box mb={3}>
          <SectionHeader
            title="Predefined Questions"
            count={availablePredefined.length}
            expanded={predefinedExpanded}
            onToggle={() => setPredefinedExpanded(!predefinedExpanded)}

          />

          <Collapse in={predefinedExpanded} timeout={300}>
            <Box sx={{ mt: 1 }}>
              {availablePredefined.length > 0 ? (
                availablePredefined.map((question, index) => (
                  <Fade key={question.id} in timeout={300 + index * 100}>
                    <div>
                      <QuestionSidebarCard question={question} />
                    </div>
                  </Fade>
                ))
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 3,
                    border: "2px dashed rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontWeight: 500,
                    }}
                  >
                    🎉 All predefined questions added!
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Custom Questions */}
        <Box>
          <SectionHeader
            title="Custom Questions"
            count={availableCustom.length}
            expanded={customExpanded}
            onToggle={() => setCustomExpanded(!customExpanded)}

          />

          <Collapse in={customExpanded} timeout={300}>
            <Box sx={{ mt: 1 }}>
              {availableCustom.length > 0 ? (
                availableCustom.map((question, index) => (
                  <Fade key={question.id} in timeout={300 + index * 100}>
                    <div>
                      <QuestionSidebarCard question={question} />
                    </div>
                  </Fade>
                ))
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 3,
                    border: "2px dashed rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontWeight: 500,
                    }}
                    gutterBottom
                  >
                    💡 No custom questions yet
                  </Typography>
                </Box>
              )}

              {/* Create Custom Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={onCreateCustom}
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  background:
                    "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #f093fb 20%, #f5576c 80%)",
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Create Custom Question
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

export default QuestionSidebar;
