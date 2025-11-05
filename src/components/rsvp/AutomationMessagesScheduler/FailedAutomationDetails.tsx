import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Error,
  ContactSupport,
  Warning,
  Phone,
  CheckCircle,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";

interface FailedAutomationDetailsProps {
  automation: SendMessagesAutomation;
}

const FailedAutomationDetails: React.FC<FailedAutomationDetailsProps> = ({
  automation,
}) => {
  const { t, language } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const completionStats = automation.completionStats;
  const failureDetails = automation.failureDetails || [];

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
              icon={<Error />}
              label={t("rsvp.statuses.failed")}
              color="error"
              variant="outlined"
            />
          </Stack>

          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t("rsvp.automationFailedDescription")}
            </Typography>
          </Alert>
        </Box>

        {/* Summary Stats */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("rsvp.executionStatistics")}
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    {t("rsvp.successfulMessages")}
                  </Typography>
                </Stack>
                <Typography variant="h6" color="success.main">
                  {completionStats?.successfulMessages || 0}
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Error color="error" fontSize="small" />
                  <Typography variant="body2">
                    {t("rsvp.failedMessages")}
                  </Typography>
                </Stack>
                <Typography variant="h6" color="error.main">
                  {completionStats?.failedMessages || 0}
                </Typography>
              </Box>

              <Divider />

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

              {completionStats?.completedAt && (
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
            </Stack>
          </CardContent>
        </Card>

        {/* Failed Messages Details */}
        {failureDetails.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("rsvp.failureDetails")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("rsvp.failureDetailsDescription")}
              </Typography>

              <List>
                {failureDetails.map((failure, index) => (
                  <ListItem
                    key={index}
                    divider={index < failureDetails.length - 1}
                  >
                    <ListItemIcon>
                      <Warning color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {t("rsvp.messageSid")}: {failure.messageSid}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {failure.errorCode && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("rsvp.errorCode")}: {failure.errorCode}
                            </Typography>
                          )}
                          {failure.errorMessage && (
                            <Typography variant="caption" color="error">
                              {failure.errorMessage}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Contact Support Card */}
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <ContactSupport color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t("rsvp.contactSupport")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("rsvp.contactSupportDescription")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Phone />}
              sx={{
                py: 1.5,
                px: 4,
                fontWeight: 600,
              }}
            >
              {t("rsvp.contactSupportButton")}
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default FailedAutomationDetails;
