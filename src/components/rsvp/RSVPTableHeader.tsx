import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import MessageTemplateSelector from "./MessageTemplateSelector";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface RSVPTableHeaderProps {
  selectedTemplates: string[];
  onTemplateSelectionChange: (selected: string[]) => void;
  selectedGuestsCount: number;
  onSendMessage: () => void;
  templates?: MessageTemplate[];
  isLoading?: boolean;
}

/**
 * RSVPTableHeader - The command center for RSVP management
 *
 * This component tells the story of the RSVP management workflow:
 * 1. Displays the table title to orient the user
 * 2. Provides template filtering to focus on specific message types
 * 3. Shows selected guest count and enables bulk messaging
 * 4. Creates a clear action-oriented header that guides user behavior
 */
const RSVPTableHeader: React.FC<RSVPTableHeaderProps> = ({
  selectedTemplates,
  onTemplateSelectionChange,
  selectedGuestsCount,
  onSendMessage,
  templates = [],
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1.5,
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flex: 1,
        }}
      >
        <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
          {t("rsvpStatusTab.rsvpList")}
        </Typography>
        <MessageTemplateSelector
          selectedTemplates={selectedTemplates}
          onSelectionChange={onTemplateSelectionChange}
          templates={templates}
          disabled={isLoading}
        />
      </Box>
      <Button
        variant="contained"
        startIcon={<SendIcon />}
        onClick={onSendMessage}
        color="primary"
        disabled={
          selectedGuestsCount === 0 ||
          selectedTemplates.length === 0 ||
          isLoading
        }
        sx={{ whiteSpace: "nowrap" }}
      >
        {t("rsvp.sendMessage")}{" "}
        {selectedGuestsCount > 0 && `(${selectedGuestsCount})`}
      </Button>
    </Box>
  );
};

export default RSVPTableHeader;
