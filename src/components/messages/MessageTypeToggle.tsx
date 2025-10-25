import React, { FC } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  PersonalVideo as PersonalIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface MessageTypeToggleProps {
  value: "whatsapp" | "sms" | "personal-whatsapp";
  onChange: (type: "whatsapp" | "sms" | "personal-whatsapp") => void;
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
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("rsvp.messageType")}
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
          {t("common.whatsapp")}
        </ToggleButton>
        <ToggleButton
          value="sms"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SmsIcon fontSize="small" />
          {t("common.sms")}
        </ToggleButton>
        <ToggleButton
          value="personal-whatsapp"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <PersonalIcon fontSize="small" />
          {t("common.personalWhatsapp")}
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default MessageTypeToggle;
