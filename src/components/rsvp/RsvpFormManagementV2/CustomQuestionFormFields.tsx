import React from "react";
import {
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
  Info as InfoIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

export interface CustomQuestionData {
  text: string;
  displayName: string;
  type: "boolean" | "select" | "number";
  options: string[];
  booleanOptions: {
    trueOption: string;
    falseOption: string;
  };
  numberOptions: {
    zeroText: string;
  };
}

interface CustomQuestionFormFieldsProps {
  question: CustomQuestionData;
  setQuestion: React.Dispatch<React.SetStateAction<CustomQuestionData>>;
  addOption: () => void;
  updateOption: (index: number, value: string) => void;
  removeOption: (index: number) => void;
  onSubmit?: () => void;
  submitting?: boolean;
  showActions?: boolean;
  onCancel?: () => void;
}

const CustomQuestionFormFields: React.FC<CustomQuestionFormFieldsProps> = ({
  question,
  setQuestion,
  addOption,
  updateOption,
  removeOption,
  onSubmit,
  submitting = false,
  showActions = false,
  onCancel,
}) => {
  const { t } = useTranslation();

  const isFormValid = () => {
    if (!question.text.trim() || !question.displayName.trim()) {
      return false;
    }
    if (
      question.type === "boolean" &&
      (!question.booleanOptions.trueOption.trim() ||
        !question.booleanOptions.falseOption.trim())
    ) {
      return false;
    }
    return true;
  };

  return (
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
          value={question.text}
          onChange={(e) =>
            setQuestion((prev) => ({ ...prev, text: e.target.value }))
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
          🏷️ {t("rsvpQuestionManager.displayNameTitle")}
        </Typography>
        <TextField
          fullWidth
          label={t("rsvpQuestionManager.displayNameLabel")}
          value={question.displayName}
          onChange={(e) =>
            setQuestion((prev) => ({
              ...prev,
              displayName: e.target.value,
            }))
          }
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
            value={question.type}
            onChange={(e) =>
              setQuestion((prev) => ({
                ...prev,
                type: e.target.value as "boolean" | "select" | "number",
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
                    {t("rsvpQuestionManager.yesNoQuestionHelper")}
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
                    {t("rsvpQuestionManager.multipleChoiceQuestionHelper")}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="number"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {t("rsvpQuestionManager.numberQuestion")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("rsvpQuestionManager.numberQuestionHelper")}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Boolean Options */}
      {question.type === "boolean" && (
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
              value={question.booleanOptions.trueOption}
              onChange={(e) =>
                setQuestion((prev) => ({
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
              value={question.booleanOptions.falseOption}
              onChange={(e) =>
                setQuestion((prev) => ({
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
      {question.type === "select" && (
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
            {question.options.map((option, index) => (
              <Box key={index} display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={t("userRsvp.form.option", {number: index + 1})}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
                {question.options.length > 2 && (
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

      {/* Number Options */}
      {question.type === "number" && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.200",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="success.main"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <IconButton size="small" disabled>
              🔢
            </IconButton>
            {t("rsvpQuestionManager.numberOptions")}
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label={t("rsvpQuestionManager.zeroTextLabel")}
              value={question.numberOptions?.zeroText ?? ""}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  numberOptions: {
                    zeroText: e.target.value,
                  },
                }))
              }
              placeholder={t("rsvpQuestionManager.zeroTextPlaceholder")}
              size="small"
              helperText={t("rsvpQuestionManager.zeroTextHelper")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.paper",
                },
              }}
            />
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <Typography variant="body2" gutterBottom>
                {t("rsvpQuestionManager.numberPreviewHelper")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  mt: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "success.300",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {question.numberOptions?.zeroText || "0"}
                </Box>
                {Array.from({ length: 10 }, (_, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "success.300",
                      fontSize: "0.875rem",
                    }}
                  >
                    {i + 1}
                  </Box>
                ))}
              </Box>
            </Alert>
          </Box>
        </Paper>
      )}

      {/* Action Buttons */}
      {showActions && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {t("rsvpQuestionManager.cancel")}
            </Button>
          )}
          {onSubmit && (
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
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomQuestionFormFields;
