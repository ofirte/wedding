import React, { useMemo, useCallback } from "react";
import { Paper, Box } from "@mui/material";
import DSTable, { Column } from "../common/DSTable";
import { InviteeWithDynamicRSVP } from "./DynamicRSVPTableColumns";
import RSVPTableHeader from "./RSVPTableHeader";
import { responsivePatterns } from "../../utils/ResponsiveUtils";
import { SentMessage } from "../../hooks/rsvp";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface DynamicRSVPDataTableProps {
  data: InviteeWithDynamicRSVP[];
  columns: Column<InviteeWithDynamicRSVP>[];
  selectedTemplates: string[];
  onTemplateSelectionChange: (selected: string[]) => void;
  selectedGuestsCount: number;
  onSelectionChange: (selected: InviteeWithDynamicRSVP[]) => void;
  onSendMessage: () => void;
  onFilteredDataChange?: (data: InviteeWithDynamicRSVP[]) => void;
  templates?: MessageTemplate[];
  sentMessages?: SentMessage[];
  isLoading?: boolean;
  showSelectColumn?: boolean;
  showExport?: boolean;
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
  selectedTemplates,
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
}) => {
  // Helper to get sent messages info for an invitee
  const getInviteeSentMessagesInfo = useCallback(
    (invitee: InviteeWithDynamicRSVP) => {
      if (!sentMessages.length || !selectedTemplates.length) {
        return { sent: false, messageTypes: [] };
      }

      const inviteeDeliveredMessages = sentMessages.filter(
        (message) =>
          message.userId === invitee.id &&
          !["failed", "undelivered"].includes(message.status) &&
          selectedTemplates.includes(message.contentSid)
      );

      const messageTypes = Array.from(
        new Set(
          inviteeDeliveredMessages.map((msg) => msg.messageType || "whatsapp")
        )
      );

      return {
        sent: inviteeDeliveredMessages.length > 0,
        messageTypes,
      };
    },
    [sentMessages, selectedTemplates]
  );

  // Preprocess data to add computed properties for filtering
  const enrichedData = useMemo(() => {
    return data.map((row) => {
      const sentInfo = getInviteeSentMessagesInfo(row);
      const flattened: any = {
        ...row,
        templateSent:
          selectedTemplates.length === 0
            ? "all"
            : sentInfo.sent
            ? "sent"
            : "notSent",
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
  }, [data, selectedTemplates, getInviteeSentMessagesInfo]);

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
          selectedTemplates={selectedTemplates}
          onTemplateSelectionChange={onTemplateSelectionChange}
          selectedGuestsCount={selectedGuestsCount}
          onSendMessage={onSendMessage}
          templates={templates}
          isLoading={isLoading}
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
