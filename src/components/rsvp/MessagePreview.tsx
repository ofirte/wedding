import React, { FC, useMemo, useCallback } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  populateVariables,
  replaceVariables,
  MessageGuest,
  MessageWedding,
} from "../../utils/messageVariables";

interface Template {
  sid: string;
  friendlyName?: string;
  types?: Record<string, any>;
}

interface MessagePreviewProps {
  template: Template | null;
  messageType: "whatsapp" | "sms" | "personal-whatsapp";
  guests: MessageGuest[];
  wedding?: MessageWedding | null;
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
  const getTemplateBody = useCallback(
    (template: Template): string => {
      if (!template.types) return t("common.noBodyAvailable");

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
        return (firstType as any).body || t("common.noBodyAvailable");
      }

      return t("common.noBodyAvailable");
    },
    [t]
  );

  // Generate preview message by replacing variables
  const previewMessage = useMemo(() => {
    if (!template) return "";

    let message = getTemplateBody(template);

    // Use centralized variable replacement with first guest as example
    if (guests.length > 0 && wedding) {
      const variables = populateVariables(guests[0], wedding);
      message = replaceVariables(message, variables);
    }

    return message;
  }, [template, guests, wedding, getTemplateBody]);

  if (!template) return null;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("rsvp.messagePreview")} (
        {messageType === "whatsapp"
          ? t("common.whatsapp")
          : messageType === "sms"
          ? t("common.sms")
          : t("common.personalWhatsapp")}
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
