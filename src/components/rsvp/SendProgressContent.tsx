import React, { FC } from "react";
import {
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { Invitee } from "../invitees/InviteList";

export interface SendResult {
  guest: Invitee;
  success: boolean;
  error?: string;
  messageId?: string;
}

interface SendProgressContentProps {
  selectedGuests: Invitee[];
  phase: "sending" | "summary";
  progress: number;
  results: SendResult[];
  currentGuestIndex: number;
  error?: string | null;
}

const SendProgressContent: FC<SendProgressContentProps> = ({
  selectedGuests,
  phase,
  progress,
  results,
  currentGuestIndex,
  error,
}) => {
  const { t } = useTranslation();

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  const getCurrentGuestName = () => {
    if (currentGuestIndex < selectedGuests.length) {
      return selectedGuests[currentGuestIndex].name;
    }
    return "";
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {phase === "sending" && (
        <>
          {/* Progress Section */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">
                {getCurrentGuestName() && (
                  <>
                    {t("rsvp.sendingTo")}:{" "}
                    <strong>{getCurrentGuestName()}</strong>
                  </>
                )}
              </Typography>
              <Typography variant="body2">
                {currentGuestIndex} / {selectedGuests.length}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Results List (as they come in) */}
          {results.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("rsvp.messageResults")}
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <List dense>
                  {results.map((result, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {result.success ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.guest.name}
                        secondary={
                          result.success
                            ? t("rsvp.messageSent")
                            : result.error || t("rsvp.messageFailed")
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </>
      )}

      {phase === "summary" && (
        <>
          {/* Simple Summary */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("rsvp.sendingSummary")}
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 2 }}
            >
              <Box>
                <Typography variant="h4" color="success.main">
                  {successCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("rsvp.messagesQueued")}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  color={failureCount > 0 ? "error.main" : "text.disabled"}
                >
                  {failureCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("rsvp.messagesFailed")}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Failed Users List - Only show if there are failures */}
          {failureCount > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "error.main" }}
              >
                {t("rsvp.failedToSend")}:
              </Typography>

              <Box
                sx={{
                  maxHeight: 150,
                  overflow: "auto",
                  border: 1,
                  borderColor: "error.light",
                  borderRadius: 1,
                  bgcolor: "error.light",
                  opacity: 0.1,
                }}
              >
                <List dense>
                  {results
                    .filter((result) => !result.success)
                    .map((result, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={result.guest.name}
                          secondary={result.error}
                        />
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Box>
          )}

          {/* Success message */}
          {successCount > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {successCount === 1
                  ? t("rsvp.messageQueuedSingular")
                  : t("rsvp.messagesQueuedPlural", { count: successCount })}
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default SendProgressContent;
