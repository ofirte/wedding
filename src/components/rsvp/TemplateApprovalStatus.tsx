import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  HowToReg as ApprovalIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useApprovalStatus } from "../../hooks/rsvp";

interface TemplateApprovalStatusProps {
  templateSid: string;
  onSubmitApproval?: () => void;
}

const TemplateApprovalStatus: React.FC<TemplateApprovalStatusProps> = ({
  templateSid,
  onSubmitApproval,
}) => {
  const { t } = useTranslation();
  const {
    data: approvalStatusData,
    refetch: refetchApprovalStatus,
    isLoading: isLoadingApprovalStatus,
  } = useApprovalStatus(templateSid);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
      case "received":
        return "info";
      case "pending":
      default:
        return "warning";
    }
  };

  const whatsappStatus = approvalStatusData?.approvalData?.whatsapp;
  const canSubmitApproval =
    !whatsappStatus ||
    (whatsappStatus.status !== "approved" &&
      whatsappStatus.status !== "pending" &&
      whatsappStatus.status !== "received");

  // Don't show anything until we have loaded the approval status
  const isStatusLoaded =
    !isLoadingApprovalStatus && approvalStatusData !== undefined;

  return (
    <Box>
      {/* Current Approval Status - More compact */}
      {whatsappStatus && isStatusLoaded ? (
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
              >
                {t("templates.whatsappStatus")}
              </Typography>
              <Chip
                icon={
                  whatsappStatus.status === "approved" ? (
                    <CheckCircleIcon />
                  ) : undefined
                }
                label={t(`templates.${whatsappStatus.status}`)}
                size="small"
                color={getStatusColor(whatsappStatus.status) as any}
              />
              {whatsappStatus.category && (
                <Chip
                  label={whatsappStatus.category}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Button
              onClick={() => refetchApprovalStatus()}
              size="small"
              variant="text"
              startIcon={
                isLoadingApprovalStatus ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              disabled={isLoadingApprovalStatus}
            >
              {t("common.refresh") || "Refresh"}
            </Button>
          </Stack>

          {/* Status explanation - more compact */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {whatsappStatus.status === "approved" &&
              t("templates.approvedForBusinessMessaging")}
            {whatsappStatus.status === "pending" &&
              t("templates.underReviewTime")}
            {whatsappStatus.status === "received" &&
              t("templates.receivedProcessingShortly")}
            {whatsappStatus.status === "rejected" &&
              t("templates.rejectedCheckReason")}
          </Typography>

          {/* Rejection reason if exists */}
          {whatsappStatus.rejection_reason && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t("templates.rejectionReason")}:</strong>{" "}
                {whatsappStatus.rejection_reason}
              </Typography>
            </Alert>
          )}
        </Box>
      ) : isStatusLoaded ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("templates.submitForWhatsappApprovalInfo")}
          </Typography>
        </Box>
      ) : (
        // Show loading state while checking approval status
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            {t("templates.checkingApprovalStatus")}
          </Typography>
        </Box>
      )}

      {/* Submit for Approval Button - only show when status is loaded */}
      {isStatusLoaded && canSubmitApproval && onSubmitApproval && (
        <Button
          onClick={onSubmitApproval}
          variant="contained"
          color="primary"
          startIcon={<ApprovalIcon />}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {t("templates.requestApproval")}
        </Button>
      )}
    </Box>
  );
};

export default TemplateApprovalStatus;
