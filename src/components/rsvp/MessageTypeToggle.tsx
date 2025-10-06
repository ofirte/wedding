import React, { FC } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
} from "@mui/material";
import { WhatsApp as WhatsAppIcon, Sms as SmsIcon } from "@mui/icons-material";

interface MessageTypeToggleProps {
  value: "whatsapp" | "sms";
  onChange: (type: "whatsapp" | "sms") => void;
  disabled?: boolean;
}

/**
 * MessageTypeToggle - Simple component for selecting between WhatsApp and SMS
 *
 * Tells the story: "How do you want to send this message?"
 */
const MessageTypeToggle: FC<MessageTypeToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Message Type
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newType) => newType && onChange(newType)}
        disabled={disabled}
        size="small"
        sx={{ mb: 1 }}
      >
        <ToggleButton
          value="whatsapp"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WhatsAppIcon fontSize="small" />
          WhatsApp
        </ToggleButton>
        <ToggleButton
          value="sms"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SmsIcon fontSize="small" />
          SMS
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default MessageTypeToggle;
