import React, { FC, useMemo } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface Template {
  sid: string;
  friendlyName?: string;
  types?: Record<string, any>;
}

interface Guest {
  id: string;
  name: string;
}

interface Wedding {
  id: string;
}

interface MessagePreviewProps {
  template: Template | null;
  messageType: "whatsapp" | "sms" | "personal-whatsapp";
  guests: Guest[];
  wedding?: Wedding | null;
}

/**
 * MessagePreview - Shows what the message will look like when sent
 *
 * Tells the story: "This is how your message will appear to recipients"
 */
const MessagePreview: FC<MessagePreviewProps> = ({
  template,
  messageType,
  guests,
  wedding,
}) => {
  const { t } = useTranslation();

  // Helper function to extract body text from template types
  const getTemplateBody = (template: Template): string => {
    if (!template.types) return "No body available";

    // Look for WhatsApp template body
    const whatsappType =
      template.types["twilio/text"] || template.types["whatsapp"];
    if (
      whatsappType &&
      typeof whatsappType === "object" &&
      whatsappType !== null
    ) {
      const body = (whatsappType as any).body;
      if (body) return body;
    }

    // Fallback to any available body
    const firstType = Object.values(template.types)[0];
    if (firstType && typeof firstType === "object" && "body" in firstType) {
      return (firstType as any).body || "No body available";
    }

    return "No body available";
  };

  // Generate preview message by replacing variables
  const previewMessage = useMemo(() => {
    if (!template) return "";

    let message = getTemplateBody(template);

    // Replace variables with first guest's name as example
    if (guests.length > 0) {
      const guestName = guests[0].name;
      const weddingId = wedding?.id ?? "";

      // Replace various variable formats
      message = message.replace(/\{\{1\}\}/g, guestName);
      message = message.replace(/\{\{guestName\}\}/g, guestName);
      message = message.replace(/\{\{weddingId\}\}/g, weddingId);
      message = message.replace(/\{guest\}/g, guestName);
      message = message.replace(/\{גוסט\}/g, guestName);
    }

    return message;
  }, [template, guests, wedding]);

  if (!template) return null;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("rsvp.messagePreview")} (
        {messageType === "whatsapp"
          ? "WhatsApp"
          : messageType === "sms"
          ? "SMS"
          : "Personal WhatsApp"}
        )
      </Typography>
      <TextField
        multiline
        rows={6}
        fullWidth
        value={previewMessage}
        InputProps={{
          readOnly: true,
        }}
        variant="outlined"
        sx={{
          "& .MuiInputBase-input": {
            fontFamily: "monospace",
            fontSize: "0.875rem",
          },
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        {t("rsvp.previewNote")}
      </Typography>
    </Box>
  );
};

export default MessagePreview;
