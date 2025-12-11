import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { enUS, he } from "date-fns/locale";

interface CompletionStatsProps {
  automation: SendMessagesAutomation;
  locale: typeof enUS | typeof he;
  t: (key: string) => string;
}

export const CompletionStats: React.FC<CompletionStatsProps> = ({
  automation,
  locale,
  t,
}) => {
  const { completionStats } = automation;

  if (!completionStats) return null;

  const { successfulMessages, failedMessages, completedAt } = completionStats;
  const totalMessages = successfulMessages + failedMessages;
  const allSuccessful = failedMessages === 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: allSuccessful ? "success.50" : "error.50",
        border: "1px solid",
        borderColor: allSuccessful ? "success.200" : "error.200",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {allSuccessful ? (
            <CheckCircleIcon color="success" fontSize="small" />
          ) : (
            <ErrorIcon color="error" fontSize="small" />
          )}
          <Typography variant="body2" fontWeight="medium">
            {allSuccessful
              ? `${t("rsvp.allMessagesSentSuccessfully") || "All messages sent successfully"} (${totalMessages})`
              : `${successfulMessages} ${t("rsvp.outOf") || "out of"} ${totalMessages} ${t("rsvp.messagesSentSuccessfully") || "messages sent successfully"}`}
          </Typography>
        </Box>
        {completedAt && (
          <Typography variant="caption" color="text.secondary">
            {format(new Date(completedAt), "PPp", { locale })}
          </Typography>
        )}
      </Box>
      {!allSuccessful && (
        <Box sx={{ mt: 1, ml: 3 }}>
          <Typography variant="body2" color="error.main">
            {failedMessages} {t("rsvp.failedMessages")?.toLowerCase() || "failed"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
