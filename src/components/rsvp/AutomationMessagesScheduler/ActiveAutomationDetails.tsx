import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Paper,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Group,
  Message,
  Pause,
  Stop,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";
import { useAllWeddingAvailableTemplates } from "src/hooks/templates/useAllWeddingAvailableTemplates";
import WhatsAppTemplatePreview from "../../templates/WhatsAppTemplatePreview";

interface ActiveAutomationDetailsProps {
  automation: SendMessagesAutomation;
  onClose?: () => void;
  onSelectAutomation?: (automation: SendMessagesAutomation) => void;
}

const ActiveAutomationDetails: React.FC<ActiveAutomationDetailsProps> = ({
  automation,
  onClose,
  onSelectAutomation,
}) => {
  const { t, language } = useTranslation();
  const { data: templates = [] } = useAllWeddingAvailableTemplates();
  const locale = language === "he" ? he : enUS;

  // Find the template being used
  const currentTemplate = templates.find(
    (t) => t.id === automation.messageTemplateId
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "inProgress":
        return "info";
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Schedule />;
      case "inProgress":
        return <Message />;
      case "completed":
        return <CheckCircle />;
      case "failed":
        return <Stop />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
      <Stack spacing={3}>
        {/* Header with Status */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
              {automation.name}
            </Typography>
            <Chip
              icon={getStatusIcon(automation.status)}
              label={t(`rsvp.status.${automation.status}`) || automation.status}
              color={getStatusColor(automation.status)}
              variant="outlined"
            />
          </Stack>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t("rsvp.automationActiveMessage")}
            </Typography>
          </Alert>
        </Box>

        {/* Automation Details */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("rsvp.scheduledTime")}
                </Typography>
                <Typography variant="body1">
                  {format(
                    new Date(automation.scheduledTime),
                    "MMM d, yyyy 'at' HH:mm",
                    {
                      locale,
                    }
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("rsvp.targetAudience")}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Group fontSize="small" />
                  <Typography variant="body1">
                    {automation.targetAudienceFilter?.attendance === true
                      ? t("rsvp.guestsAttending")
                      : automation.targetAudienceFilter?.attendance === false
                      ? t("rsvp.guestsNotAttending")
                      : t("rsvp.allGuests")}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("rsvp.messagesSent")}
                </Typography>
                <Typography variant="body1">
                  {automation.sentMessagesIds?.length || 0} {t("rsvp.messages")}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("rsvp.automationType")}
                </Typography>
                <Typography variant="body1">
                  {t(`rsvp.automationType.${automation.automationType}`) ||
                    automation.automationType}
                </Typography>
              </Box>

              {automation.completionStats && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("rsvp.completionStats")}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {t("rsvp.successfulMessages")}:{" "}
                      {automation.completionStats.successfulMessages}
                    </Typography>
                    <Typography variant="body2">
                      {t("rsvp.failedMessages")}:{" "}
                      {automation.completionStats.failedMessages}
                    </Typography>
                    <Typography variant="body2">
                      {t("rsvp.completedAt")}:{" "}
                      {format(
                        automation.completionStats.completedAt,
                        "MMM d, yyyy HH:mm",
                        { locale }
                      )}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Template Preview */}
        {currentTemplate && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("templates.messageTemplate")}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <WhatsAppTemplatePreview
                showHeader={false}
                template={currentTemplate}
                scheduledTime={new Date(automation.scheduledTime)}
                automationName={automation.name}
              />
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack spacing={2}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<Stop />}
            color="error"
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {t("rsvp.deactivateAutomation")}
          </Button>

          {automation.failureDetails &&
            automation.failureDetails.length > 0 && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {t("rsvp.viewFailureDetails")} (
                {automation.failureDetails.length})
              </Button>
            )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ActiveAutomationDetails;
