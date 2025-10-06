import React, { FC, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { Send as SendIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useMessageTemplates } from "../../hooks/rsvp/useMessageTemplates";
import { useSendMessage } from "../../hooks/rsvp/useSendMessage";
import { useSendSMSMessage } from "../../hooks/rsvp/useSendSMSMessage";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { Invitee } from "../invitees/InviteList";
import MessageTypeToggle from "./MessageTypeToggle";
import TemplateSelector from "./TemplateSelector";
import MessagePreview from "./MessagePreview";

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
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: sendSMSMessage } = useSendSMSMessage();
  const { data: wedding } = useWeddingDetails();
  // Extract templates array from the response
  const templates = useMemo(
    () => templatesResponse?.templates || [],
    [templatesResponse?.templates]
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [messageType, setMessageType] = useState<"whatsapp" | "sms">(
    "whatsapp"
  );
  const [sending, setSending] = useState(false);

  // Get the selected template
  const selectedTemplate = useMemo(() => {
    return templates.find(
      (template: any) => template.sid === selectedTemplateId
    );
  }, [templates, selectedTemplateId]);

  const handleSend = async () => {
    if (!selectedTemplate || selectedGuests.length === 0) return;

    // Basic validation

    setSending(true);

    try {
      const sendPromises = selectedGuests.map((guest) => {
        const contentVariables = {
          guestName: guest.name,
          guestId: guest.id,
          weddingId: wedding?.id ?? "",
        };

        if (messageType === "whatsapp") {
          const phoneNumber = guest.cellphone.startsWith("+")
            ? `whatsapp:${guest.cellphone}`
            : `whatsapp:+972${guest.cellphone}`;

          return sendMessage({
            to: phoneNumber,
            contentSid: selectedTemplate.sid,
            contentVariables,
            userId: guest.id,
          });
        } else {
          // SMS
          const phoneNumber = guest.cellphone.startsWith("+")
            ? guest.cellphone
            : `+972${guest.cellphone}`;
          return sendSMSMessage({
            to: phoneNumber,
            contentSid: selectedTemplate.sid,
            contentVariables,
            userId: guest.id,
          });
        }
      });

      await Promise.all(sendPromises);
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
      setMessageType("whatsapp");
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
          <Typography variant="h6">
            {t("rsvp.sendMessage")} (
            {messageType === "whatsapp" ? "WhatsApp" : "SMS"})
          </Typography>
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

          {/* Message Type Selection */}
          <MessageTypeToggle
            value={messageType}
            onChange={setMessageType}
            disabled={sending}
          />

          <Divider />

          {/* Template selection */}
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onChange={setSelectedTemplateId}
            disabled={sending}
          />

          {/* Message preview */}
          <MessagePreview
            template={selectedTemplate || null}
            messageType={messageType}
            guests={selectedGuests}
            wedding={wedding}
          />

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
            : `Send ${messageType === "whatsapp" ? "WhatsApp" : "SMS"} (${
                selectedGuests.length
              })`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendMessageDialog;
