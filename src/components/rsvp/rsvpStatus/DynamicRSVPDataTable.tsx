import React, { useMemo, useCallback } from "react";
import { Paper, Box } from "@mui/material";
import DSTable, { Column } from "../../common/DSTable";
import RSVPTableHeader from "./RSVPTableHeader";
import { responsivePatterns } from "../../../utils/ResponsiveUtils";
import { SentMessage } from "@wedding-plan/types";
import { InviteeWithDynamicRSVP } from "./DynamicRSVPTableColumns";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface DynamicRSVPDataTableProps {
  data: InviteeWithDynamicRSVP[];
  columns: Column<InviteeWithDynamicRSVP>[];
  selectedTemplate: string | undefined;
  onTemplateSelectionChange: (selected: string) => void;
  selectedGuestsCount: number;
  onSelectionChange: (selected: InviteeWithDynamicRSVP[]) => void;
  onSendMessage: () => void;
  onFilteredDataChange?: (data: InviteeWithDynamicRSVP[]) => void;
  templates?: MessageTemplate[];
  sentMessages?: SentMessage[];
  isLoading?: boolean;
  showSelectColumn?: boolean;
  showExport?: boolean;
  isAdmin?: boolean;
}

/**
 * DynamicRSVPDataTable - Dynamic RSVP data table with configurable columns
 *
 * This component provides complete RSVP management with dynamic columns:
 * 1. Template filtering to focus on specific communication needs
 * 2. Comprehensive guest information for planning decisions
 * 3. Bulk messaging capabilities for efficient communication
 * 4. Dynamic columns based on configured RSVP questions
 */
const DynamicRSVPDataTable: React.FC<DynamicRSVPDataTableProps> = ({
  data,
  columns,
  selectedTemplate,
  onTemplateSelectionChange,
  selectedGuestsCount,
  onSelectionChange,
  onSendMessage,
  onFilteredDataChange,
  templates = [],
  sentMessages = [],
  isLoading = false,
  showSelectColumn = true,
  showExport = true,
  isAdmin = false,
}) => {
  // Helper to get sent messages info for an invitee
  const getInviteeSentMessagesInfo = useCallback(
    (invitee: InviteeWithDynamicRSVP) => {
      if (!sentMessages.length || !selectedTemplate) {
        return { status: "notSent", messageTypes: [] };
      }

      // Get all message attempts for this invitee and selected templates
      const inviteeMessages = sentMessages.filter(
        (message) =>
          message.userId === invitee.id &&
          message.contentSid === selectedTemplate
      );

      if (inviteeMessages.length === 0) {
        return { status: "notSent", messageTypes: [] };
      }

      // Check for successful messages
      const deliveredMessages = inviteeMessages.filter(
        (message) => !["failed", "undelivered"].includes(message.status)
      );

      // Check for failed messages
      const failedMessages = inviteeMessages.filter((message) =>
        ["failed", "undelivered"].includes(message.status)
      );

      const messageTypes = Array.from(
        new Set(deliveredMessages.map((msg) => msg.messageType || "whatsapp"))
      );

      // Determine status priority: if ANY attempt succeeded, mark as sent
      // Only mark as failed if ALL attempts failed
      let status: "sent" | "failed" | "notSent";
      if (deliveredMessages.length > 0) {
        // At least one message was delivered successfully
        status = "sent";
      } else if (failedMessages.length > 0) {
        // Only failed messages exist (no successful deliveries)
        status = "failed";
      } else {
        // No message attempts at all
        status = "notSent";
      }

      return {
        status,
        messageTypes,
      };
    },
    [sentMessages, selectedTemplate]
  );

  // Preprocess data to add computed properties for filtering
  const enrichedData = useMemo(() => {
    return data.map((row) => {
      const sentInfo = getInviteeSentMessagesInfo(row);
      const flattened: any = {
        ...row,
        templateSent: !selectedTemplate ? "all" : sentInfo.status, // Use the status directly: "sent", "failed", or "notSent"
        sentMessageTypes: sentInfo.messageTypes,
      };
      // Flatten all RSVP status properties for filtering
      if (row.rsvpStatus) {
        Object.keys(row.rsvpStatus).forEach((key) => {
          flattened[key] = row.rsvpStatus![key];
        });
      }

      return flattened;
    });
  }, [data, selectedTemplate, getInviteeSentMessagesInfo]);

  const handleSelectionChange = (selected: InviteeWithDynamicRSVP[]) => {
    // Filter selected guests to only include those with phone numbers
    const selectedWithPhones = selected.filter(
      (guest) => guest.cellphone && guest.cellphone.trim() !== ""
    );
    onSelectionChange(selectedWithPhones);
  };

  const handleDisplayedDataChange = useCallback(
    (displayedData: InviteeWithDynamicRSVP[]) => {
      onFilteredDataChange?.(displayedData);
    },
    [onFilteredDataChange]
  );

  return (
    <Box
      sx={{
        mt: { xs: 2, sm: 3 },
        mx: { xs: -1, sm: 0 }, // Negative margin on mobile to use full width
        width: { xs: "calc(100% + 16px)", sm: "100%" }, // Extend beyond container padding on mobile
        maxWidth: "100vw", // Prevent exceeding viewport width
        overflowX: "hidden", // Prevent horizontal scrolling
      }}
    >
      <Paper
        sx={{
          ...responsivePatterns.containerPadding,
          overflow: "hidden", // Prevent horizontal scrolling
          width: "100%",
          maxWidth: "100%", // Ensure it doesn't exceed container
          boxSizing: "border-box",
        }}
      >
        <RSVPTableHeader
          selectedTemplate={selectedTemplate || ""}
          onTemplateSelectionChange={onTemplateSelectionChange}
          selectedGuestsCount={selectedGuestsCount}
          onSendMessage={onSendMessage}
          templates={templates}
          isLoading={isLoading}
          isAdmin={isAdmin}
        />
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            width: "100%",
            overflow: "hidden", // Prevent any child overflow
          }}
        >
          <DSTable
            columns={columns}
            data={enrichedData}
            exportAddedColumns={[
              {
                id: "cellphone",
                label: "Phone Number",
              },
            ]}
            showSelectColumn={showSelectColumn}
            showExport={showExport}
            onSelectionChange={handleSelectionChange}
            onDisplayedDataChange={handleDisplayedDataChange}
            exportFilename="dynamic-rsvp-data"
            mobileCardTitle={(row) => ` ${row.name}`}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DynamicRSVPDataTable;
