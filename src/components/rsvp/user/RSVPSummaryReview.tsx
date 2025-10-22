import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  Launch as LaunchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface RSVPSetupState {
  formCompleted: boolean;
  templatesSelected: string[];
  automationsScheduled: string[];
  setupCompleted: boolean;
}

interface RSVPSummaryReviewProps {
  setupState: RSVPSetupState;
  onLaunch: () => void;
}

/**
 * RSVPSummaryReview - Final review and launch step
 *
 * Shows a summary of the user's RSVP setup and allows them to launch
 * their automated messaging campaign.
 */
const RSVPSummaryReview: React.FC<RSVPSummaryReviewProps> = ({
  setupState,
  onLaunch,
}) => {
  const { t } = useTranslation();

  const summaryItems = [
    {
      title: t("userRsvp.review.rsvpForm"),
      description: t("userRsvp.review.rsvpFormDesc"),
      completed: setupState.formCompleted,
      icon: <EditIcon />,
      color: "#2196F3",
    },
    {
      title: t("userRsvp.review.messageTemplates"),
      description: t("userRsvp.review.messageTemplatesDesc", {
        count: setupState.templatesSelected.length,
      }),
      completed: setupState.templatesSelected.length === 5,
      icon: <WhatsAppIcon />,
      color: "#25D366",
    },
    {
      title: t("userRsvp.review.automationSchedule"),
      description: t("userRsvp.review.automationScheduleDesc", {
        count: setupState.automationsScheduled.length,
      }),
      completed: setupState.automationsScheduled.length === 5,
      icon: <ScheduleIcon />,
      color: "#FF9800",
    },
  ];

  const isReadyToLaunch = summaryItems.every((item) => item.completed);

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        textAlign="center"
        sx={{ fontWeight: 600 }}
      >
        {t("userRsvp.review.title")}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        paragraph
      >
        {t("userRsvp.review.description")}
      </Typography>

      {/* Setup Summary */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t("userRsvp.review.setupSummary")}
          </Typography>

          <List sx={{ py: 0 }}>
            {summaryItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: item.completed
                          ? item.color
                          : "#f5f5f5",
                        color: item.completed ? "white" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.completed ? <CheckCircleIcon /> : item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {item.title}
                        </Typography>
                        {item.completed && (
                          <Chip
                            label={t("common.completed")}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={item.description}
                  />
                </ListItem>
                {index < summaryItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {t("userRsvp.review.whatHappensNext")}
          </Typography>

          <List sx={{ py: 0 }}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#E3F2FD",
                    color: "#1976D2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  1
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={t("userRsvp.review.step1Title")}
                secondary={t("userRsvp.review.step1Desc")}
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#E8F5E8",
                    color: "#2E7D32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  2
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={t("userRsvp.review.step2Title")}
                secondary={t("userRsvp.review.step2Desc")}
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#FFF3E0",
                    color: "#F57C00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  3
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={t("userRsvp.review.step3Title")}
                secondary={t("userRsvp.review.step3Desc")}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <Box textAlign="center">
        {isReadyToLaunch ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<LaunchIcon />}
            onClick={onLaunch}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.125rem",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            {t("userRsvp.review.launchRsvpSystem")}
          </Button>
        ) : (
          <Alert severity="warning">
            <Typography variant="body2">
              {t("userRsvp.review.completeAllSteps")}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Success Message */}
      {setupState.setupCompleted && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            🎉 {t("userRsvp.review.launchSuccess")}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default RSVPSummaryReview;
