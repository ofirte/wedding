import React, { useMemo, useCallback } from "react";
import { Paper, Box } from "@mui/material";
import DSTable from "../common/DSTable";
import RSVPTableHeader from "./RSVPTableHeader";
import { useRSVPTableColumns, InviteeWithRSVP } from "./RSVPTableColumns";
import { responsivePatterns } from "../../utils/ResponsiveUtils";
import { SentMessage } from "../../hooks/rsvp";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface RSVPDataTableProps {
  data: InviteeWithRSVP[];
  selectedTemplates: string[];
  onTemplateSelectionChange: (selected: string[]) => void;
  selectedGuestsCount: number;
  onSelectionChange: (selected: InviteeWithRSVP[]) => void;
  onSendMessage: () => void;
  templates?: MessageTemplate[];
  sentMessages?: SentMessage[];
  isLoading?: boolean;
  onFilteredDataChange?: (data: InviteeWithRSVP[]) => void;
}

/**
 * RSVPDataTable - The heart of RSVP data management
 *
 * This component tells the complete story of RSVP data interaction:
 * 1. Provides filtering and action controls through the header
 * 2. Displays comprehensive RSVP information in an organized table
 * 3. Enables bulk operations through guest selection
 * 4. Maintains focus on the wedding planning workflow
 *
 * It combines header controls with data presentation to create
 * a cohesive data management experience.
 */
const RSVPDataTable: React.FC<RSVPDataTableProps> = ({
  data,
  selectedTemplates,
  onTemplateSelectionChange,
  selectedGuestsCount,
  onSelectionChange,
  onSendMessage,
  templates = [],
  sentMessages = [],
  isLoading = false,
  onFilteredDataChange,
}) => {
  // Helper to check if templates were sent to an invitee
  const wasAnySelectedTemplateSentToInvitee = useCallback(
    (invitee: InviteeWithRSVP): boolean => {
      if (!sentMessages.length || !selectedTemplates.length) return false;
      const inviteeDeliveredMessages = sentMessages.filter(
        (message) =>
          message.userId === invitee.id &&
          !["failed", "undelivered"].includes(message.status)
      );

      return inviteeDeliveredMessages.some((message) =>
        selectedTemplates.includes(message.contentSid)
      );
    },
    [sentMessages, selectedTemplates]
  );

  // Preprocess data to add computed properties for filtering
  const enrichedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      templateSent:
        selectedTemplates.length === 0
          ? "all"
          : wasAnySelectedTemplateSentToInvitee(row)
          ? "sent"
          : "notSent",
      // Add flattened properties for filtering
      attendance: row.rsvpStatus?.attendance,
      sleepover: row.rsvpStatus?.sleepover,
      ride: row.rsvpStatus?.rideFromTelAviv,
      submitted: row.rsvpStatus?.isSubmitted,
    }));
  }, [data, selectedTemplates, wasAnySelectedTemplateSentToInvitee]);

  const columns = useRSVPTableColumns({
    selectedTemplates,
    sentMessages,
  });

  const handleSelectionChange = (selected: InviteeWithRSVP[]) => {
    // Filter selected guests to only include those with phone numbers
    const selectedWithPhones = selected.filter(
      (guest) => guest.cellphone && guest.cellphone.trim() !== ""
    );
    onSelectionChange(selectedWithPhones);
  };

  const handleDisplayedDataChange = useCallback(
    (displayedData: InviteeWithRSVP[]) => {
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
            showSelectColumn={true}
            onSelectionChange={handleSelectionChange}
            onDisplayedDataChange={handleDisplayedDataChange}
            mobileCardTitle={(row) => ` ${row.name}`}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default RSVPDataTable;
