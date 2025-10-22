import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  HowToReg as ApprovalIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useSubmitTemplateApproval } from "../../hooks/templates";
import { formatTemplateName } from "../../utils/templatesUtils";

interface TemplateApprovalWorkflowProps {
  templateSid: string;
  templateName: string;
  onBack: () => void;
  onSuccess?: () => void;
}

const TemplateApprovalWorkflow: React.FC<TemplateApprovalWorkflowProps> = ({
  templateSid,
  templateName,
  onBack,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("UTILITY");
  const {
    mutate: submitTemplateApproval,
    isPending: isPendingApprovalResponse,
    isSuccess: isSubmittedForApprovalSuccess,
    isError: isSubmitApprovalError,
    error: submitApprovalError,
    reset: resetSubmitApprovalState,
  } = useSubmitTemplateApproval();

  const handleSubmitApproval = () => {
    submitTemplateApproval(
      {
        templateSid,
        approvalRequest: {
          templateSid,
          name: formatTemplateName(templateName),
          category: selectedCategory,
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const categories = [
    { value: "UTILITY", label: t("templates.categoryUtility") },
    { value: "MARKETING", label: t("templates.categoryMarketing") },
    { value: "AUTHENTICATION", label: t("templates.categoryAuthentication") },
  ];

  return (
    <Box
      sx={{
        paddingX: ({ spacing }) => spacing(4),
      }}
    >
      {/* Header - cleaner */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="text"
        size="small"
      >
        {t("common.back")}
      </Button>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" component="h3">
            {t("templates.whatsappApproval")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("templates.submitForBusinessMessaging")} "{templateName}"
          </Typography>
        </Box>
      </Box>

      {/* Approval Form - cleaner layout */}
      {!isSubmittedForApprovalSuccess && (
        <Stack spacing={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("templates.selectCategoryDescription")}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>{t("templates.approvalCategory")}</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label={t("templates.approvalCategory")}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "grey.50",
              border: 1,
              borderColor: "grey.200",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>{t("templates.whatHappensNext")}</strong>
              <br />• {t("templates.templateSubmittedForReview")}
              <br />• {t("templates.approvalTakesTime")}
              <br />• {t("templates.trackStatusInDetails")}
              <br />• {t("templates.onceApprovedUseForMessaging")}
            </Typography>
          </Paper>

          <Button
            onClick={handleSubmitApproval}
            variant="contained"
            color="primary"
            size="large"
            startIcon={
              isPendingApprovalResponse ? (
                <CircularProgress size={16} />
              ) : (
                <ApprovalIcon />
              )
            }
            disabled={isPendingApprovalResponse}
            fullWidth
            sx={{ py: 2 }}
          >
            {isPendingApprovalResponse
              ? t("templates.submitting")
              : t("templates.requestWhatsappApproval")}
          </Button>
        </Stack>
      )}

      {/* Success State */}
      {isSubmittedForApprovalSuccess && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, textAlign: "center" }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom color="success.main">
            {t("templates.approvalSuccess")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("templates.templateSubmittedSuccessMessage")}
          </Typography>
          <Button variant="outlined" onClick={onBack}>
            {t("common.back")}
          </Button>
        </Paper>
      )}

      {/* Error State */}
      {isSubmitApprovalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            {t("templates.approvalError")}
          </Typography>
          <Typography variant="body2">
            {submitApprovalError instanceof Error
              ? submitApprovalError.message
              : t("templates.unknownError")}
          </Typography>
          <Button
            onClick={() => resetSubmitApprovalState()}
            size="small"
            sx={{ mt: 1 }}
          >
            {t("common.tryAgain")}
          </Button>
        </Alert>
      )}
    </Box>
  );
};

export default TemplateApprovalWorkflow;
