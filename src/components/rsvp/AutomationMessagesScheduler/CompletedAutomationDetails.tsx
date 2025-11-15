import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Grid,
} from "@mui/material";
import { CheckCircle, Group, Send } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";

interface CompletedAutomationDetailsProps {
  automation: SendMessagesAutomation;
}

const CompletedAutomationDetails: React.FC<CompletedAutomationDetailsProps> = ({
  automation,
}) => {
  const { t, language } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const completionStats = automation.completionStats;

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
              icon={<CheckCircle />}
              label={t("rsvp.statuses.completed")}
              color="success"
              variant="outlined"
            />
          </Stack>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t("rsvp.automationCompletedDescription")}
            </Typography>
          </Alert>
        </Box>

        {/* Summary Stats Cards */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Send color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={600} color="primary">
                  {completionStats?.successfulMessages || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("rsvp.successfulMessages")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={6}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Group color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={600} color="primary">
                  {(completionStats?.successfulMessages || 0) +
                    (completionStats?.failedMessages || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("rsvp.totalMessagesSent")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Execution Details Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("rsvp.executionStatistics")}
            </Typography>
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

              {completionStats && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("rsvp.completedAt")}
                  </Typography>
                  <Typography variant="body1">
                    {format(
                      new Date(completionStats.completedAt),
                      "MMM d, yyyy 'at' HH:mm",
                      { locale }
                    )}
                  </Typography>
                </Box>
              )}

              <Box>
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

              {completionStats?.failedMessages &&
                completionStats.failedMessages > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      {completionStats.failedMessages}{" "}
                      {t("rsvp.failedMessages").toLowerCase()}
                    </Typography>
                  </Alert>
                )}
            </Stack>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Alert severity="success" sx={{ textAlign: "center" }}>
          <Typography variant="body1" fontWeight={600}>
            {t("rsvp.messageSentTo", {
              count: completionStats?.successfulMessages || 0,
            })}
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};

export default CompletedAutomationDetails;
