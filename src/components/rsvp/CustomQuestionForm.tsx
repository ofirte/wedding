import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Alert,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface CustomQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
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
  setNewQuestion: React.Dispatch<
    React.SetStateAction<{
      text: string;
      displayName: string;
      type: "boolean" | "select";
      options: string[];
      booleanOptions: {
        trueOption: string;
        falseOption: string;
      };
    }>
  >;
  addOption: () => void;
  updateOption: (index: number, value: string) => void;
  removeOption: (index: number) => void;
  submitting?: boolean;
}

const CustomQuestionForm: React.FC<CustomQuestionFormProps> = ({
  open,
  onClose,
  onSubmit,
  newQuestion,
  setNewQuestion,
  addOption,
  updateOption,
  removeOption,
  submitting = false,
}) => {
  const { t } = useTranslation();

  const isFormValid = () => {
    if (!newQuestion.text.trim() || !newQuestion.displayName.trim()) {
      return false;
    }
    if (
      newQuestion.type === "boolean" &&
      (!newQuestion.booleanOptions.trueOption.trim() ||
        !newQuestion.booleanOptions.falseOption.trim())
    ) {
      return false;
    }
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon sx={{ color: "white" }} />
          <Typography variant="h6" fontWeight="700" color="white">
            ✨ {t("rsvpQuestionManager.createCustomQuestion")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 4,
          background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          minHeight: "60vh",
        }}
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {/* Question Text */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary.main"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              📝 Question Details
            </Typography>
            <TextField
              fullWidth
              label={t("rsvpQuestionManager.questionText")}
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion((prev) => ({ ...prev, text: e.target.value }))
              }
              helperText={t("rsvpQuestionManager.questionTextHelper")}
              multiline
              rows={3}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "grey.50",
                  "&:hover": {
                    backgroundColor: "background.paper",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "background.paper",
                  },
                },
              }}
            />
          </Paper>

          {/* Display Name */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary.main"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              🏷️ Table Display Name
            </Typography>
            <TextField
              fullWidth
              label={t("rsvpQuestionManager.displayNameLabel")}
              value={newQuestion.displayName}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              helperText={t("rsvpQuestionManager.displayNameHelper")}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "grey.50",
                  "&:hover": {
                    backgroundColor: "background.paper",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "background.paper",
                  },
                },
              }}
            />
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "info.200",
                backgroundColor: "info.50",
              }}
            >
              {t("rsvpQuestionManager.displayNameAlert")}
            </Alert>
          </Paper>

          {/* Question Type */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "grey.50",
            }}
          >
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  "&.Mui-focused": { color: "text.primary" },
                }}
              >
                {t("rsvpQuestionManager.questionType")}
              </FormLabel>
              <RadioGroup
                value={newQuestion.type}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    type: e.target.value as "boolean" | "select",
                  }))
                }
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="boolean"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {t("rsvpQuestionManager.yesNoQuestion")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Radio buttons for true/false choices
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="select"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {t("rsvpQuestionManager.multipleChoiceQuestion")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dropdown menu with multiple options
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* Boolean Options */}
          {newQuestion.type === "boolean" && (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary.main"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <IconButton size="small" disabled>
                  ⚪
                </IconButton>
                {t("rsvpQuestionManager.booleanOptions")}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label={t("rsvpQuestionManager.trueOptionLabel")}
                  value={newQuestion.booleanOptions.trueOption}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      booleanOptions: {
                        ...prev.booleanOptions,
                        trueOption: e.target.value,
                      },
                    }))
                  }
                  placeholder={t("common.yes")}
                  size="small"
                  helperText={t("rsvpQuestionManager.trueOptionHelper")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={t("rsvpQuestionManager.falseOptionLabel")}
                  value={newQuestion.booleanOptions.falseOption}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      booleanOptions: {
                        ...prev.booleanOptions,
                        falseOption: e.target.value,
                      },
                    }))
                  }
                  placeholder={t("common.no")}
                  size="small"
                  helperText={t("rsvpQuestionManager.falseOptionHelper")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
              </Box>
            </Paper>
          )}

          {/* Select Options */}
          {newQuestion.type === "select" && (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "secondary.50",
                border: "1px solid",
                borderColor: "secondary.200",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="secondary.main"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <IconButton size="small" disabled>
                  📝
                </IconButton>
                {t("rsvpQuestionManager.answerOptions")}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {newQuestion.options.map((option, index) => (
                  <Box key={index} display="flex" gap={1} alignItems="center">
                    <TextField
                      fullWidth
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                    {newQuestion.options.length > 2 && (
                      <IconButton
                        onClick={() => removeOption(index)}
                        color="error"
                        size="small"
                        sx={{
                          bgcolor: "error.50",
                          "&:hover": {
                            bgcolor: "error.100",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={addOption}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: "flex-start",
                  }}
                >
                  {t("rsvpQuestionManager.addOption")}
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "grey.50",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {t("rsvpQuestionManager.cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!isFormValid() || submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            minWidth: 120,
          }}
        >
          {submitting
            ? t("common.creating")
            : t("rsvpQuestionManager.createQuestion")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomQuestionForm;
