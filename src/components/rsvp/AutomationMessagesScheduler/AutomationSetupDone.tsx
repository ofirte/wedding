import { Typography, Paper, Fade } from "@mui/material";
import { Box } from "@mui/system";
import React, { FC } from "react";
import { useTranslation } from "src/localization/LocalizationContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const AutomationSetupDone: FC = () => {
  const { t } = useTranslation();
  return (
    <Fade in timeout={800}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: "background.paper",
          maxWidth: 500,
          mx: "auto",
          mt: 4,
          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 64,
              color: "success.main",
              mb: 2,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.05)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("automationSetupDone.allDone") ||
              "Select an automation to configure"}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 400, mb: 3 }}>
            {t("automationSetupDone.pleaseReview") ||
              "Choose an automation from the sidebar to edit its schedule, template, and settings."}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default AutomationSetupDone;
