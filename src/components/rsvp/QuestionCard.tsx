import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  RadioButtonChecked as BooleanIcon,
  List as SelectIcon,
  Delete as DeleteIcon,
  Star as RequiredIcon,
  StarBorder as OptionalIcon,
} from "@mui/icons-material";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import { useTranslation } from "../../localization/LocalizationContext";

interface QuestionCardProps {
  question: RSVPQuestion;
  onDelete?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  showDeleteButton?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onDelete,
  isDragging = false,
  dragHandleProps,
  showDeleteButton = true,
}) => {
  const { t } = useTranslation();

  const getTypeIcon = (type: string) => {
    return type === "boolean" ? (
      <BooleanIcon sx={{ fontSize: 20, color: "primary.main" }} />
    ) : (
      <SelectIcon sx={{ fontSize: 20, color: "secondary.main" }} />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "boolean" ? "primary" : "secondary";
  };

  const getTypeLabel = (type: string) => {
    return type === "boolean"
      ? t("rsvpQuestionManager.yesNoType")
      : t("rsvpQuestionManager.multipleChoiceType");
  };

  const getOptionsPreview = () => {
    if (question.type === "boolean" && question.booleanOptions) {
      return `${question.booleanOptions.trueOption} / ${question.booleanOptions.falseOption}`;
    }
    if (question.type === "select" && question.options) {
      return (
        question.options.slice(0, 2).join(", ") +
        (question.options.length > 2
          ? ` +${question.options.length - 2} more`
          : "")
      );
    }
    return null;
  };

  return (
    <Card
      sx={{
        position: "relative",
        mb: 2,
        transition: "all 0.3s ease",
        transform: isDragging ? "rotate(5deg)" : "none",
        boxShadow: isDragging ? 8 : 2,
        "&:hover": {
          transform: isDragging ? "rotate(5deg)" : "translateY(-2px)",
          boxShadow: isDragging ? 8 : 6,
        },
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 3,
        overflow: "visible",
      }}
    >
      {/* Custom Badge */}
      {question.isCustom && (
        <Chip
          label={t("rsvpQuestionManager.customLabel")}
          size="small"
          color="secondary"
          sx={{
            position: "absolute",
            top: -8,
            right: 12,
            fontWeight: 600,
            fontSize: "0.75rem",
            height: 20,
            zIndex: 1,
          }}
        />
      )}

      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Drag Handle */}
          <Box
            {...dragHandleProps}
            sx={{
              cursor: "grab",
              color: "grey.400",
              "&:hover": { color: "grey.600" },
              "&:active": { cursor: "grabbing" },
              mt: 0.5,
            }}
          >
            <DragIcon />
          </Box>

          {/* Content */}
          <Box flex={1}>
            {/* Header with type icon and required indicator */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {getTypeIcon(question.type)}
              <Chip
                label={getTypeLabel(question.type)}
                size="small"
                color={getTypeColor(question.type)}
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Box ml="auto">
                <Tooltip
                  title={
                    question.required
                      ? t("rsvpQuestionManager.requiredLabel")
                      : "Optional"
                  }
                >
                  {question.required ? (
                    <RequiredIcon
                      sx={{ fontSize: 18, color: "warning.main" }}
                    />
                  ) : (
                    <OptionalIcon sx={{ fontSize: 18, color: "grey.400" }} />
                  )}
                </Tooltip>
              </Box>
            </Box>

            {/* Question Text */}
            <Typography
              variant="h6"
              fontWeight={600}
              color="text.primary"
              gutterBottom
              sx={{
                fontSize: "1rem",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {question.questionText}
            </Typography>

            {/* Display Name */}
            {question.displayName && (
              <Box
                sx={{
                  bgcolor: "grey.100",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 2,
                  border: "1px dashed",
                  borderColor: "grey.300",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {t("rsvpQuestionManager.tableLabel")}:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {question.displayName}
                </Typography>
              </Box>
            )}

            {/* Options Preview */}
            {getOptionsPreview() && (
              <Box
                sx={{
                  bgcolor: "primary.50",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight={500}
                >
                  Options:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    wordBreak: "break-word",
                  }}
                >
                  {getOptionsPreview()}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            {showDeleteButton && question.isCustom && onDelete && (
              <Tooltip title="Delete question">
                <IconButton
                  onClick={onDelete}
                  size="small"
                  color="error"
                  sx={{
                    bgcolor: "error.50",
                    "&:hover": {
                      bgcolor: "error.100",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
