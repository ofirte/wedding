import React, { FC } from "react";
import { Box, Typography } from "@mui/material";
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

  if (isLoading) {
    return <DSLoading />;
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          {error instanceof Error
            ? error.message
            : t("rsvpStatusTab.unknownError")}
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
        mobileCardTitle={(row) => `${row.firstName} ${row.lastName}`}
      />
    </Box>
  );
};

export default MessagesLogTab;
