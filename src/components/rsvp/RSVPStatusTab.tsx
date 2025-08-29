import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRSVPStatuses } from "../../hooks/rsvp/useRSVPStatuses";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useSentMessages } from "../../hooks/rsvp/useSentMessages";
import { useMessageTemplates } from "../../hooks/rsvp/useMessageTemplates";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { Invitee } from "../invitees/InviteList";
import { useTranslation } from "../../localization/LocalizationContext";
import SendMessageDialog from "./SendMessageDialog";
import RSVPStatusSummary from "./RSVPStatusSummary";
import RSVPDataTable from "./RSVPDataTable";
import { InviteeWithRSVP } from "./RSVPTableColumns";

/**
 * RSVPStatusTab - The Wedding RSVP Management Story
 *
 * This component orchestrates the complete RSVP management experience:
 *
 * Chapter 1: Overview (RSVPStatusSummary)
 *   - Shows the big picture: how many attending, pending, etc.
 *   - Gives wedding planners immediate insight into response status
 *
 * Chapter 2: Detailed Management (RSVPDataTable)
 *   - Template filtering to focus on specific communication needs
 *   - Comprehensive guest information for planning decisions
 *   - Bulk messaging capabilities for efficient communication
 *
 * Chapter 3: Action (SendMessageDialog)
 *   - Direct communication with selected guests
 *   - Closes the loop on RSVP follow-up
 *
 * The component focuses on the wedding planning workflow:
 * Assess → Filter → Act → Follow-up
 */
const RSVPStatusTab: React.FC = () => {
  const { t } = useTranslation();

  // Data Management - The foundation of our story
  const { data: rsvpStatuses, isLoading: isLoadingRSVP } = useRSVPStatuses();
  const { data: invitees, isLoading: isLoadingInvitees } = useInvitees();
  const { data: sentMessages = [] } = useSentMessages();
  const { data: messageTemplatesData } = useMessageTemplates();

  // Interactive State - What the user is currently working with
  const [selectedGuests, setSelectedGuests] = useState<Invitee[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Data Transformation - Combining invitees with their RSVP status
  const inviteesWithRSVP: InviteeWithRSVP[] = useMemo(() => {
    if (!invitees || !rsvpStatuses) return [];
    return invitees.map((invitee) => ({
      ...invitee,
      rsvpStatus: rsvpStatuses[invitee.id],
    }));
  }, [invitees, rsvpStatuses]);

  // Event Handlers - The story's interactive moments
  const handleTemplateSelectionChange = (selected: string[]) => {
    setSelectedTemplates(selected);
  };

  const handleGuestSelectionChange = (selected: InviteeWithRSVP[]) => {
    setSelectedGuests(selected);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Loading State - Setting the stage
  if (isLoadingRSVP || isLoadingInvitees) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>{t("rsvpStatusTab.loadingData")}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <RSVPStatusSummary inviteesWithRSVP={inviteesWithRSVP} />

      <RSVPDataTable
        data={inviteesWithRSVP}
        selectedTemplates={selectedTemplates}
        onTemplateSelectionChange={handleTemplateSelectionChange}
        selectedGuestsCount={selectedGuests.length}
        onSelectionChange={handleGuestSelectionChange}
        onSendMessage={handleOpenDialog}
        templates={messageTemplatesData?.templates || []}
        sentMessages={sentMessages}
        isLoading={isLoadingRSVP || isLoadingInvitees}
      />

      <SendMessageDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedGuests={selectedGuests}
      />
    </Box>
  );
};

export default RSVPStatusTab;
