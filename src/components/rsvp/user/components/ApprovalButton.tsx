import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { Launch, CheckCircle } from "@mui/icons-material";
import { useTranslation } from "../../../../localization/LocalizationContext";

interface ApprovalButtonProps {
  onApprove: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ApprovalButton: React.FC<ApprovalButtonProps> = ({
  onApprove,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Button
        variant="contained"
        size="large"
        color="primary"
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Launch />
          )
        }
        onClick={onApprove}
        disabled={disabled || isLoading}
        sx={{
          minWidth: 200,
          py: 1.5,
        }}
      >
        {isLoading
          ? t("userRsvp.scheduler.creatingAutomations")
          : t("userRsvp.scheduler.approvePlan")}
      </Button>
    </Box>
  );
};
