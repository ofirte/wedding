import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Fade,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Search as SearchIcon,
  RadioButtonChecked as BooleanIcon,
  List as SelectIcon,
} from "@mui/icons-material";
import { RSVPQuestion } from "src/api/rsvp/rsvpQuestionsTypes";
import CustomQuestionForm from "./CustomQuestionForm";


interface QuestionBankModalProps {
  open: boolean;
  onClose: () => void;
  predefinedQuestions: RSVPQuestion[];
  customQuestions: RSVPQuestion[];
  selectedQuestionIds: string[];
  onAddQuestion: (question: RSVPQuestion) => void;
  // Custom question form props
  isCustomFormOpen: boolean;
  setIsCustomFormOpen: (open: boolean) => void;
  newQuestion: {
    text: string;
    displayName: string;
    type: "boolean" | "select";
    options: string[];
    booleanOptions: {
      trueOption: string;
      falseOption: string;
    };
  };
  setNewQuestion: React.Dispatch<React.SetStateAction<any>>;
  addOption: () => void;
  updateOption: (index: number, value: string) => void;
  removeOption: (index: number) => void;
  onCreateCustomQuestion: () => void;
  submitting?: boolean;
}

const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  open,
  onClose,
  predefinedQuestions,
  customQuestions,
  selectedQuestionIds,
  onAddQuestion,
  isCustomFormOpen,
  setIsCustomFormOpen,
  newQuestion,
  setNewQuestion,
  addOption,
  updateOption,
  removeOption,
  onCreateCustomQuestion,
  submitting = false,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const availablePredefined = predefinedQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const availableCustom = customQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const handleAddAndClose = (question: RSVPQuestion) => {
    onAddQuestion(question);
    // Don't close modal to allow adding multiple questions
  };

  const QuestionCard = ({ question }: { question: RSVPQuestion }) => (
    <Box
      onClick={() => handleAddAndClose(question)}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#3b82f6",
          backgroundColor: "#f8fafc",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor:
              question.type === "boolean" ? "#dbeafe" : "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {question.type === "boolean" ? (
            <BooleanIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
          ) : (
            <SelectIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
          )}
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
        {question.isCustom && (
          <Chip
            label="Custom"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "none",
            }}
          />
        )}
      </Box>
      <Typography
        variant="body2"
        fontWeight={500}
        color="#111827"
        sx={{ mb: 1.5, lineHeight: 1.5 }}
      >
        {question.questionText}
      </Typography>
      {question.displayName && (
        <Typography
          variant="caption"
          color="#6b7280"
          sx={{
            display: "block",
            backgroundColor: "#f3f4f6",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            mb: 2,
          }}
        >
          Table: {question.displayName}
        </Typography>
      )}
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
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          "&:hover": {
            backgroundColor: "#3b82f6",
            color: "white",
          },
        }}
      >
        Add to Form
      </Button>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="#111827"
              gutterBottom
            >
              🎯 Add Questions to Your Form
            </Typography>
            <Typography variant="body2" color="#6b7280">
              Choose from our pre-made questions or create your own custom ones
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "#f3f4f6" }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                px: 3,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
              }}
            >
              <Tab
                icon={<SearchIcon />}
                iconPosition="start"
                label={`Browse Questions (${
                  availablePredefined.length + availableCustom.length
                })`}
              />
              <Tab
                icon={<AddIcon />}
                iconPosition="start"
                label="Create Custom"
              />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ p: 4 }}>
              {availablePredefined.length === 0 &&
              availableCustom.length === 0 ? (
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
                    🎉 All questions added!
                  </Typography>
                  <Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
                    You've added all available questions. Create a custom one if
                    needed.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTabValue(1)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      backgroundColor: "#3b82f6",
                    }}
                  >
                    Create Custom Question
                  </Button>
                </Box>
              ) : (
                <>
                  {availablePredefined.length > 0 && (
                    <Box mb={4}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="#111827"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        📋 Pre-made Questions
                        <Chip
                          label={availablePredefined.length}
                          size="small"
                          sx={{
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "0.7rem",
                          }}
                        />
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#6b7280"
                        sx={{ mb: 3 }}
                      >
                        Commonly used RSVP questions ready to add to your form
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        {availablePredefined.map((question, index) => (
                          <Fade key={question.id} in timeout={200 + index * 50}>
                            <div>
                              <QuestionCard question={question} />
                            </div>
                          </Fade>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {availableCustom.length > 0 && (
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="#111827"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        ⚡ Your Custom Questions
                        <Chip
                          label={availableCustom.length}
                          size="small"
                          sx={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            fontSize: "0.7rem",
                          }}
                        />
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#6b7280"
                        sx={{ mb: 3 }}
                      >
                        Questions you've created for your specific needs
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        {availableCustom.map((question, index) => (
                          <Fade key={question.id} in timeout={200 + index * 50}>
                            <div>
                              <QuestionCard question={question} />
                            </div>
                          </Fade>
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  borderRadius: 3,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  mb: 4,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="#111827"
                  gutterBottom
                >
                  ✨ Create Your Perfect Question
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 3 }}>
                  Craft a custom question that fits your specific needs
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCustomFormOpen(true)}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    backgroundColor: "#3b82f6",
                    "&:hover": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                >
                  Start Creating
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Question Form */}
      <CustomQuestionForm
        open={isCustomFormOpen}
        onClose={() => setIsCustomFormOpen(false)}
        onSubmit={onCreateCustomQuestion}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        submitting={submitting}
      />
    </>
  );
};

export default QuestionBankModal;
