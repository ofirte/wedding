import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";

interface AutomationInfoDialogProps {
  open: boolean;
  onClose: () => void;
  automation: SendMessagesAutomation | null;
  templateName?: string;
}

/**
 * AutomationInfoDialog - Display comprehensive automation information
 * 
 * Shows automation details including:
 * - Basic info (name, type, status, scheduled time)  
 * - Execution stats (total messages sent, success/failure counts)
 * - Failure details if any messages failed
 */
const AutomationInfoDialog: React.FC<AutomationInfoDialogProps> = ({
  open,
  onClose,
  automation,
  templateName,
}) => {
  const { t } = useTranslation();

  if (!automation) {
    return null;
  }

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

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case "rsvp":
        return t("rsvp.rsvpAutomation");
      case "reminder":
        return t("rsvp.reminderAutomation");
      default:
        return type;
    }
  };

  const totalMessages = automation.sentMessagesIds.length;
  const successfulMessages = automation.completionStats?.successfulMessages || 0;
  const failedMessages = automation.completionStats?.failedMessages || 0;
  const hasFailures = failedMessages > 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            {t("rsvp.automationDetails")}
          </Typography>
          <Button
            onClick={onClose}
            color="inherit"
            size="small"
            startIcon={<CloseIcon />}
          >
            {t("common.close")}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Automation Basic Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("rsvp.basicInformation")}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.automationName")}
                    </Typography>
                    <Typography variant="body1">
                      {automation.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.automationType")}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getAutomationTypeLabel(automation.automationType)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.status")}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={automation.status}
                        color={getStatusColor(automation.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("templates.templateName")}
                    </Typography>
                    <Typography variant="body1">
                      {templateName || automation.messageTemplateId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.scheduledTime")}
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(automation.scheduledTime), "PPp")}
                      {automation.scheduledTimeZone && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({automation.scheduledTimeZone})
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.dateCreated")}
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(automation.createdAt), "PP")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Execution Statistics */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("rsvp.executionStatistics")}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.contrastText">
                    {totalMessages}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    {t("rsvp.totalMessagesSent")}
                  </Typography>
                </Box>
                <Box textAlign="center" sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                  <Typography variant="h4" color="success.contrastText">
                    {successfulMessages}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    {t("rsvp.successfulMessages")}
                  </Typography>
                </Box>
                <Box textAlign="center" sx={{ p: 2, bgcolor: "error.light", borderRadius: 1 }}>
                  <Typography variant="h4" color="error.contrastText">
                    {failedMessages}
                  </Typography>
                  <Typography variant="body2" color="error.contrastText">
                    {t("rsvp.failedMessages")}
                  </Typography>
                </Box>
              </Box>

              {automation.completionStats?.completedAt && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("rsvp.completedAt")}: {format(new Date(automation.completionStats.completedAt), "PPp")}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Failure Details - Only show if there are failures */}
          {hasFailures && automation.failureDetails && automation.failureDetails.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  <ErrorIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  {t("rsvp.failureDetails")}
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t("rsvp.failureDetailsDescription")}
                </Alert>
                <List>
                  {automation.failureDetails.map((failure, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {t("rsvp.messageSid")}: {failure.messageSid}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {failure.errorCode && (
                              <Typography variant="caption" color="error">
                                {t("rsvp.errorCode")}: {failure.errorCode}
                              </Typography>
                            )}
                            {failure.errorMessage && (
                              <Typography variant="caption" color="error" sx={{ display: "block" }}>
                                {t("rsvp.errorMessage")}: {failure.errorMessage}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          {automation.status === "inProgress" && (
            <Alert severity="info" icon={<InfoIcon />}>
              {t("rsvp.automationInProgressInfo")}
            </Alert>
          )}

          {automation.status === "completed" && !hasFailures && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              {t("rsvp.automationCompletedSuccessfully")}
            </Alert>
          )}

          {automation.status === "failed" && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {t("rsvp.automationFailedInfo")}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutomationInfoDialog;
