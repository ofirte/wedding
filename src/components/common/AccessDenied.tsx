import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Lock, AdminPanelSettings, Group } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";

interface AccessDeniedProps {
  reason: "admin" | "wedding" | "general";
  title?: string;
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason,
  title,
  message,
  redirectPath = "/weddings",
  redirectLabel,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getReasonConfig = () => {
    switch (reason) {
      case "admin":
        return {
          icon: (
            <AdminPanelSettings sx={{ fontSize: 80, color: "error.main" }} />
          ),
          defaultTitle: t("admin.adminAccessRequired"),
          defaultMessage: t("admin.contactSystemAdmin"),
          defaultRedirectLabel: t("common.goToWeddings"),
        };
      case "wedding":
        return {
          icon: <Group sx={{ fontSize: 80, color: "warning.main" }} />,
          defaultTitle: t("wedding.noAccessToWedding"),
          defaultMessage: t("wedding.contactWeddingOwner"),
          defaultRedirectLabel: t("common.goToWeddings"),
        };
      default:
        return {
          icon: <Lock sx={{ fontSize: 80, color: "text.secondary" }} />,
          defaultTitle: t("common.accessDenied"),
          defaultMessage: t("common.insufficientPermissions"),
          defaultRedirectLabel: t("common.goBack"),
        };
    }
  };

  const config = getReasonConfig();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 3 }}>{config.icon}</Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          {title || config.defaultTitle}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            lineHeight: 1.6,
            fontSize: "1.1rem",
          }}
        >
          {message || config.defaultMessage}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(redirectPath)}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {redirectLabel || config.defaultRedirectLabel}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {t("common.back")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccessDenied;
