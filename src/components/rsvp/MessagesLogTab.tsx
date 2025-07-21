import React, { FC } from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import DSTable from "../common/DSTable";
import { useSentMessages } from "../../hooks/rsvp";
import { createSentMessagesColumns } from "./SentMessagesColumns";
import { useTranslation } from "../../localization/LocalizationContext";
import DSLoading from "../common/DSLoading";
import { useInvitees } from "../../hooks/invitees/useInvitees";

const MessagesLogTab: FC = () => {
  const { t } = useTranslation();
  const sentMessagesQuery = useSentMessages();

  const {
    data: sentMessages = [],
    isLoading,
    isError,
    error,
  } = sentMessagesQuery;
  const { data: guests } = useInvitees();
  const columns = createSentMessagesColumns(t, guests || []);

  // Calculate statistics
  const stats = {
    total: sentMessages.length,
    delivered: sentMessages.filter((msg) => msg.status === "delivered").length,
    failed: sentMessages.filter(
      (msg) => msg.status === "failed" || msg.status === "undelivered"
    ).length,
    pending: sentMessages.filter(
      (msg) => msg.status === "queued" || msg.status === "accepted"
    ).length,
  };

  if (isLoading) {
    return <DSLoading />;
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading messages:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">{t("rsvp.messagesLog")}</Typography>
      </Box>

      <DSTable
        columns={columns}
        data={sentMessages}
        showExport={true}
        exportFilename="sent-messages"
      />
    </Box>
  );
};

export default MessagesLogTab;
