import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  RocketLaunch as RocketIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useCreateDefaultRSVPConfig } from "../../hooks/rsvp/useCreateDefaultRSVPConfig";
import { useCreateInitialAutomations } from "src/hooks/rsvp";

const RSVPWelcomePage: React.FC = () => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: createDefaultRSVPConfig } = useCreateDefaultRSVPConfig();
  const { mutate: createInitialAutomations } = useCreateInitialAutomations();

  const handleGetStarted = () => {
    setIsCreating(true);

    // First create the default RSVP config
    createDefaultRSVPConfig(undefined, {
      onSuccess: () => {
        // After RSVP config is created, create the initial automations
        createInitialAutomations(undefined, {
          onSuccess: () => {
            // Both operations completed successfully
            // Success is handled by the mutation's onSuccess callbacks
            // which will invalidate queries and cause a re-render
          },
          onError: (error) => {
            setIsCreating(false);
            console.error("Failed to create initial automations:", error);
          },
        });
      },
      onError: (error) => {
        setIsCreating(false);
        console.error("Failed to create default RSVP config:", error);
      },
    });
  };

  const steps = [
    {
      label: t("rsvp.welcome.step1Title"),
      description: t("rsvp.welcome.step1Description"),
      icon: <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      label: t("rsvp.welcome.step2Title"),
      description: t("rsvp.welcome.step2Description"),
      icon: <ScheduleIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
    },
  ];

  return (
    <Container
      maxWidth="md"
      sx={{ py: 8, height: "100%", display: "flex", alignItems: "center" }}
    >
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Header */}
            <Box textAlign="center">
              <RocketIcon
                sx={{
                  fontSize: 80,
                  color: "primary.main",
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                {t("rsvp.welcome.title")}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                {t("rsvp.welcome.subtitle")}
              </Typography>
            </Box>

            {/* Steps Overview */}
            <Box sx={{ width: "100%", maxWidth: 800 }}>
              <Typography
                variant="h5"
                fontWeight="600"
                textAlign="center"
                gutterBottom
                sx={{ mb: 4 }}
              >
                {t("rsvp.welcome.stepsTitle")}
              </Typography>

              <Stack spacing={3}>
                {steps.map((step, index) => (
                  <Card
                    key={index}
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box
                          sx={{
                            minWidth: 80,
                            height: 80,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid",
                            borderColor:
                              index === 0 ? "primary.light" : "secondary.light",
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            color="text.primary"
                            gutterBottom
                          >
                            {`${index + 1}. ${step.label}`}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* CTA Button */}
            <Box sx={{ pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                disabled={isCreating}
                startIcon={
                  isCreating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RocketIcon />
                  )
                }
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  borderRadius: 3,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
                  },
                  "&:disabled": {
                    background: "grey.400",
                  },
                }}
              >
                {isCreating
                  ? t("rsvp.welcome.creating")
                  : t("rsvp.welcome.getStarted")}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default RSVPWelcomePage;
