import React from "react";
import { Box, Alert, AlertTitle, CircularProgress } from "@mui/material";
import { Email, CheckCircle } from "@mui/icons-material";
import { useValidateInvitationToken } from "../../hooks/invitations/useValidateInvitationToken";
import { useTranslation } from "../../localization/LocalizationContext";

interface InvitationBannerProps {
  token: string | null;
}

export const InvitationBanner: React.FC<InvitationBannerProps> = ({
  token,
}) => {
  const { t } = useTranslation();
  const { data: validation, isLoading } = useValidateInvitationToken(token);

  if (!token || isLoading) {
    return isLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    ) : null;
  }

  if (!validation?.valid) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>{t("invitations.banner.invalidInvitation")}</AlertTitle>
        {validation && "expired" in validation && (validation as any).expired
          ? t("invitations.banner.expiredInvitation")
          : validation?.message || t("invitations.banner.invalidInvitation")}
      </Alert>
    );
  }

  return (
    <Alert
      severity="info"
      icon={<CheckCircle />}
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
        border: "2px solid",
        borderColor: "primary.light",
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, color: "primary.dark" }}>
        {t("invitations.banner.producerInvitation")}
      </AlertTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <Email sx={{ fontSize: 18, color: "primary.main" }} />
        <Box>
          {t("invitations.banner.invitedAs")}{" "}
          <strong>{"email" in validation ? (validation as any).email : ""}</strong>
        </Box>
      </Box>
      <Box sx={{ mt: 1, fontSize: "0.875rem", color: "text.secondary" }}>
        {t("invitations.banner.signInPrompt")}
      </Box>
    </Alert>
  );
};

export default InvitationBanner;
