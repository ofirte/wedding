import React, { FC, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { Send as SendIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useMessageTemplates } from "../../hooks/rsvp/useMessageTemplates";
import { useSendMessage } from "../../hooks/rsvp/useSendMessage";
import { Invitee } from "../invitees/InviteList";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  selectedGuests: Invitee[];
}

const SendMessageDialog: FC<SendMessageDialogProps> = ({
  open,
  onClose,
  selectedGuests,
}) => {
  const { t } = useTranslation();
  const { data: templatesResponse } = useMessageTemplates();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { data: wedding } = useWeddingDetails();
  // Extract templates array from the response
  const templates = templatesResponse?.templates || [];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [sending, setSending] = useState(false);

  // Get the selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(
      (template: any) => template.sid === selectedTemplateId
    );
  }, [templates, selectedTemplateId]);

  // Helper function to extract body text from template types
  const getTemplateBody = (template: any): string => {
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
    if (!selectedTemplate) return "";

    let message = getTemplateBody(selectedTemplate);

    // Replace common variables like {{1}} with first guest's name as example
    if (selectedGuests.length > 0) {
      message = message.replace(/\{\{1\}\}/g, selectedGuests[0].name);
      message = message.replace(/\{guest\}/g, selectedGuests[0].name);
      message = message.replace(/\{גוסט\}/g, selectedGuests[0].name);
    }

    return message;
  }, [selectedTemplate, selectedGuests]);

  const handleSend = async () => {
    if (!selectedTemplate || selectedGuests.length === 0) return;

    setSending(true);

    try {
      for (const guest of selectedGuests) {
        const phoneNumber = guest.cellphone.startsWith("+")
          ? `whatsapp:${guest.cellphone}`
          : `whatsapp:+972${guest.cellphone}`;

        sendMessage({
          to: phoneNumber,
          contentSid: selectedTemplate.sid,
          contentVariables: {
            guestName: guest.name,
            guestId: guest.id,
            weddingId: wedding?.id ?? "",
          },
          userId: guest.id,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error sending messages:", error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSelectedTemplateId("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{t("rsvp.sendMessage")}</Typography>
          <Button
            onClick={handleClose}
            disabled={sending}
            size="small"
            sx={{ minWidth: "auto", p: 1 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("rsvp.selectedGuests")} ({selectedGuests.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedGuests.slice(0, 5).map((guest) => (
                <Chip
                  key={guest.id}
                  label={guest.name}
                  size="small"
                  variant="outlined"
                />
              ))}
              {selectedGuests.length > 5 && (
                <Chip
                  label={`+${selectedGuests.length - 5} ${t("common.more")}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Template selection */}
          <FormControl fullWidth>
            <InputLabel>{t("rsvp.selectTemplate")}</InputLabel>
            <Select
              value={selectedTemplateId}
              label={t("rsvp.selectTemplate")}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={sending}
            >
              {templates.map((template: any) => (
                <MenuItem key={template.sid} value={template.sid}>
                  {template.friendlyName || template.sid}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Message preview */}
          {selectedTemplate && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("rsvp.messagePreview")}
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
          )}

          {/* Warning for multiple recipients */}
          {selectedGuests.length > 1 && (
            <Alert severity="info">
              {t("rsvp.bulkSendWarning", { count: selectedGuests.length })}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={sending} variant="outlined">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          disabled={!selectedTemplate || selectedGuests.length === 0 || sending}
          variant="contained"
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {sending
            ? t("rsvp.sending")
            : t("rsvp.sendToGuests", { count: selectedGuests.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendMessageDialog;
