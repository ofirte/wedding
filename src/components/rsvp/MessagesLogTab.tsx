import React, { FC } from "react";
import { Box, Typography } from "@mui/material";
import DSTable from "../common/DSTable";
import { useSentMessages } from "../../hooks/rsvp";
import { createSentMessagesColumns } from "./SentMessagesColumns";
import { useTranslation } from "../../localization/LocalizationContext";
import DSLoading from "../common/DSLoading";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import MessageStatusUpdate from "./MessageStatusUpdate";

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
      {sentMessages.map((message) => (
        <MessageStatusUpdate
          key={message.id}
          messageSid={message.sid}
          messageId={message.id}
          originalStatus={message.status}
        />
      ))}
      <DSTable
        columns={columns}
        data={sentMessages}
        showExport={true}
        exportFilename="sent-messages"
        mobileCardTitle={(row) => `${row.firstName} ${row.lastName}`}
      />
    </Box>
  );
};

export default MessagesLogTab;
