import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,

  Chip,

} from "@mui/material";
import { Schedule, Group, AccessTime } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";
import { useAllWeddingAvailableTemplates } from "src/hooks/templates/useAllWeddingAvailableTemplates";
import WhatsAppTemplatePreview from "../../templates/WhatsAppTemplatePreview";

interface PendingAutomationDetailsProps {
  automation: SendMessagesAutomation;
}

const PendingAutomationDetails: React.FC<PendingAutomationDetailsProps> = ({
  automation,
}) => {
  const { t, language } = useTranslation();
  const { data: templates = [] } = useAllWeddingAvailableTemplates();
  const locale = language === "he" ? he : enUS;

  // Find the template being used
  const currentTemplate = templates.find(
    (t) => t.id === automation.messageTemplateId
  );

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
              icon={<Schedule />}
              label={t("rsvp.statuses.pending")}
              color="warning"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Scheduled Time Card */}
        <Card
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <AccessTime sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
              {t("rsvp.scheduledTime")}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {format(new Date(automation.scheduledTime), "MMM d, yyyy", {
                locale,
              })}
            </Typography>
            <Typography variant="h5" fontWeight={400} sx={{ mt: 0.5 }}>
              {format(new Date(automation.scheduledTime), "HH:mm", {
                locale,
              })}
            </Typography>
          </CardContent>
        </Card>

        {/* Template Preview - Most Important */}
        {currentTemplate && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
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
            </CardContent>
          </Card>
        )}

        {/* Target Audience Card */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Group color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("rsvp.targetAudience")}
                </Typography>
                <Typography variant="body1">
                  {automation.targetAudienceFilter?.attendance === true
                    ? t("rsvp.guestsAttending")
                    : automation.targetAudienceFilter?.attendance === false
                    ? t("rsvp.guestsNotAttending")
                    : t("rsvp.allGuests")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default PendingAutomationDetails;
