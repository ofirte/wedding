import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useInvitees } from "../../../hooks/invitees/useInvitees";
import { useSentMessages } from "../../../hooks/rsvp/useSentMessages";

import { Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../../localization/LocalizationContext";
import { InviteeRSVP } from "../../../api/rsvp/rsvpQuestionsTypes";
import DynamicRSVPStatusSummary from "./DynamicRSVPStatusSummary";
import DynamicRSVPDataTable from "./DynamicRSVPDataTable";
import SendMessageDialog from "../../messages/SendMessageDialog";
import {
  InviteeWithDynamicRSVP,
  useDynamicRSVPTableColumns,
} from "./DynamicRSVPTableColumns";
import { responsivePatterns } from "../../../utils/ResponsiveUtils";
import { useAllWeddingAvailableTemplates } from "src/hooks/templates/useAllWeddingAvailableTemplates";

/**
 * RSVPStatusTab - Dynamic RSVP Management based on configured questions
 *
 * This component provides complete RSVP management that adapts to the
 * questions configured in the RSVP form builder:
 *
 * 1. Dynamic Summary - Statistics based on enabled questions
 * 2. Dynamic Table - Columns generated from configured questions
 * 3. Flexible Filtering - Works with any question type
 * 4. Consistent Data - Uses the same questions as the guest form
 */
const RSVPStatusTab: React.FC = () => {
  const { t } = useTranslation();

  // Data Management
  const { data: invitees, isLoading: isLoadingInvitees } = useInvitees();
  const { data: sentMessages = [] } = useSentMessages();
  const { data: weddingTemplates } = useAllWeddingAvailableTemplates();

  // Interactive State
  const [selectedGuests, setSelectedGuests] = useState<Invitee[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get the selected template object for SendMessageDialog
  const selectedTemplateObj = useMemo(() => {
    if (!selectedTemplate || !weddingTemplates) return null;

    return (
      weddingTemplates.find(
        (template) => template.sid === selectedTemplate
      ) || null
    );
  }, [selectedTemplate, weddingTemplates]);
  const [statusFilter, setStatusFilter] = useState<{
    type: string;
    value: any;
  } | null>(null);

  // Transform invitees to include dynamic RSVP structure
  const inviteesWithDynamicRSVP = useMemo(() => {
    return (invitees || []).map((invitee) => ({
      ...invitee,
      rsvpStatus: invitee.rsvpStatus as unknown as InviteeRSVP,
    })) as InviteeWithDynamicRSVP[];
  }, [invitees]);

  // Get dynamic table columns
  const columns = useDynamicRSVPTableColumns({
    selectedTemplate,
    sentMessages,
  });

  // Apply dynamic filtering based on any question
  const filteredInvitees = useMemo(() => {
    if (!statusFilter) return inviteesWithDynamicRSVP;

    return inviteesWithDynamicRSVP.filter((invitee) => {
      const rsvpStatus = invitee.rsvpStatus;
      const fieldValue = rsvpStatus?.[statusFilter.type];
      return fieldValue === statusFilter.value;
    });
  }, [inviteesWithDynamicRSVP, statusFilter]);

  // Event Handlers
  const handleTemplateSelectionChange = (selected: string) => {
    setSelectedTemplate(selected);
  };

  const handleGuestSelectionChange = (selected: any[]) => {
    setSelectedGuests(selected);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFilteredDataChange = (data: any[]) => {
    // Optional: Track displayed data after DSTable filtering
  };

  const handleFilterClick = (filterType: string, value: any) => {
    // Toggle filter - if same filter clicked, clear it
    if (statusFilter?.type === filterType && statusFilter?.value === value) {
      setStatusFilter(null);
    } else {
      setStatusFilter({ type: filterType, value });
    }
  };

  // Loading State
  if (isLoadingInvitees) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>{t("rsvpStatusTab.loadingData")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={responsivePatterns.containerPadding}>
      <DynamicRSVPStatusSummary
        inviteesWithRSVP={inviteesWithDynamicRSVP}
        onFilterClick={handleFilterClick}
        activeFilter={statusFilter}
      />

      <DynamicRSVPDataTable
        data={filteredInvitees}
        columns={columns}
        selectedTemplate={selectedTemplate}
        onTemplateSelectionChange={handleTemplateSelectionChange}
        selectedGuestsCount={selectedGuests.length}
        onSelectionChange={handleGuestSelectionChange}
        onSendMessage={handleOpenDialog}
        onFilteredDataChange={handleFilteredDataChange}
        templates={weddingTemplates || []}
        sentMessages={sentMessages}
        isLoading={isLoadingInvitees}
        showSelectColumn={true}
        showExport={true}
      />

      <SendMessageDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedGuests={selectedGuests}
        selectedTemplate={selectedTemplateObj}
      />
    </Box>
  );
};

export default RSVPStatusTab;
