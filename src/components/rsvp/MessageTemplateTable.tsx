import React from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import DSTable from "../common/DSTable";
import { useMessageTemplates } from "../../hooks/rsvp/useMessageTemplates";
import {
  createMessageTemplateColumns,
  MessageTemplateRow,
} from "./MessageTemplateColumns";

const MessageTemplateTable: React.FC = () => {
  const { data, isLoading, error } = useMessageTemplates();
  const columns = createMessageTemplateColumns();
  const transformedData: MessageTemplateRow[] = React.useMemo(() => {
    if (!data?.templates) return [];

    return data.templates
      .filter((template) => !!template.types?.["twilio/media"])
      .map(
        (template) =>
          ({
            ...template,
            id: template.sid, // Use Twilio SID as the id
          } as MessageTemplateRow)
      );
  }, [data?.templates]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading message templates...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load message templates:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </Alert>
    );
  }

  if (!data?.templates || data.templates.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No message templates found. Create templates in your Twilio Console to
        get started.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Message Templates ({data.length})
      </Typography>
      <DSTable
        columns={columns}
        data={transformedData}
        showExport={true}
        exportFilename="message-templates"
        mobileCardTitle={(row) => `${row.friendlyName}`}
      />
    </Box>
  );
};

export default MessageTemplateTable;
