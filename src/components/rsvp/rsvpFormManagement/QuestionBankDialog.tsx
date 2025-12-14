import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  QuestionAnswer as QuestionIcon,
  RadioButtonChecked as BooleanIcon,
  List as SelectIcon,
} from "@mui/icons-material";
import { useTranslation } from "src/localization/LocalizationContext";
import { RSVPQuestion } from "@wedding-plan/types";

interface QuestionBankDialogProps {
  open: boolean;
  onClose: () => void;
  predefinedQuestions: RSVPQuestion[];
  customQuestions: RSVPQuestion[];
  selectedQuestionIds: string[];
  onAddQuestion: (question: RSVPQuestion) => void;
  onCreateCustom: () => void;
}

const QuestionBankDialog: React.FC<QuestionBankDialogProps> = ({
  open,
  onClose,
  predefinedQuestions,
  customQuestions,
  selectedQuestionIds,
  onAddQuestion,
  onCreateCustom,
}) => {
  const { t } = useTranslation();

  const availablePredefined = predefinedQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const availableCustom = customQuestions.filter(
    (q) => !selectedQuestionIds.includes(q.id)
  );

  const getTypeIcon = (type: string) => {
    return type === "boolean" ? (
      <BooleanIcon sx={{ fontSize: 20 }} />
    ) : (
      <SelectIcon sx={{ fontSize: 20 }} />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "boolean" ? "primary" : "secondary";
  };

  const QuestionCard = ({ question }: { question: RSVPQuestion }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[8],
        },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
          {getTypeIcon(question.type)}
          <Box flexGrow={1}>
            <Typography
              variant="subtitle2"
              fontWeight="600"
              color="text.primary"
              gutterBottom
            >
              {question.questionText}
            </Typography>
            <Chip
              label={
                question.type === "boolean"
                  ? t("rsvpQuestionManager.yesNoType")
                  : t("rsvpQuestionManager.multipleChoiceType")
              }
              size="small"
              color={getTypeColor(question.type)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            {question.displayName && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("rsvpQuestionManager.tableLabel")}: {question.displayName}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onAddQuestion(question)}
          fullWidth
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("rsvpQuestionManager.add")}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: "70vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <QuestionIcon color="primary" />
          <Typography variant="h6" fontWeight="700">
            {t("rsvpQuestionManager.questionBank")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, fontStyle: "italic" }}
        >
          {t("rsvpQuestionManager.bankDescription")}
        </Typography>

        {/* Predefined Questions */}
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight="600"
            color="primary.main"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <QuestionIcon fontSize="small" />
            {t("rsvpQuestionManager.predefinedQuestions")}
          </Typography>
          {availablePredefined.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              {availablePredefined.map((question) => (
                <QuestionCard question={question} key={question.id} />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "grey.300",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                All predefined questions are already added
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Custom Questions */}
        <Box>
          <Typography
            variant="h6"
            fontWeight="600"
            color="secondary.main"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <AddIcon fontSize="small" />
            {t("rsvpQuestionManager.customQuestions")}
          </Typography>
          {availableCustom.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              {availableCustom.map((question) => (
                <QuestionCard question={question} key={question.id} />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "grey.300",
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No custom questions available
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onCreateCustom}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {t("rsvpQuestionManager.createCustomQuestion")}
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "grey.50",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onCreateCustom}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("rsvpQuestionManager.createCustom")}
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("rsvpQuestionManager.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionBankDialog;
