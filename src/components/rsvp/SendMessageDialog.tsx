import React, { FC, useState } from "react";
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
import { useSendMessage } from "../../hooks/rsvp/useSendMessage";
import { useSendSMSMessage } from "../../hooks/rsvp/useSendSMSMessage";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { Invitee } from "../invitees/InviteList";
import { populateVariables } from "../../utils/messageVariables";
import MessageTypeToggle from "./MessageTypeToggle";
import MessagePreview from "./MessagePreview";
import PersonalWhatsAppList from "./PersonalWhatsAppList";
import PersonalWhatsAppCloseDialog from "./PersonalWhatsAppCloseDialog";

interface Template {
  sid: string;
  friendlyName?: string;
  types?: Record<string, any>;
}

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  selectedGuests: Invitee[];
  selectedTemplate: Template | null;
}

const SendMessageDialog: FC<SendMessageDialogProps> = ({
  open,
  onClose,
  selectedGuests,
  selectedTemplate,
}) => {
  const { t } = useTranslation();
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: sendSMSMessage } = useSendSMSMessage();
  const { data: wedding } = useWeddingDetails();
  const [messageType, setMessageType] = useState<
    "whatsapp" | "sms" | "personal-whatsapp"
  >("whatsapp");
  const [sending, setSending] = useState(false);
  const [clickedGuests, setClickedGuests] = useState<Set<string>>(new Set());
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const handleSend = async () => {
    if (!selectedTemplate || selectedGuests.length === 0) return;

    setSending(true);

    try {
      // API-based sending (WhatsApp or SMS) - Personal WhatsApp is handled separately
      const sendPromises = selectedGuests.map((guest) => {
        // Use centralized variable population system
        const contentVariables = populateVariables(
          guest,
          wedding || { id: "" }
        );

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
      // Check if we're in personal WhatsApp mode and have clicked but unsent guests
      if (messageType === "personal-whatsapp") {
        const pendingGuests = selectedGuests.filter((guest) =>
          clickedGuests.has(guest.id)
        );

        if (pendingGuests.length > 0) {
          setShowCloseDialog(true);
          return;
        }
      }
      handleActualClose();
    }
  };

  const handleActualClose = () => {
    setMessageType("whatsapp");
    setClickedGuests(new Set());
    setShowCloseDialog(false);
    onClose();
  };

  const handleMarkAsSentAndClose = async (guestIds: string[]) => {
    // Mark all pending guests as sent by calling the actual save logic
    for (const guestId of guestIds) {
      const guest = selectedGuests.find((g) => g.id === guestId);
      if (guest && selectedTemplate) {
        try {
          // Use the same logic as PersonalWhatsAppList.handleMarkAsSent
          const cleanNumber = guest.cellphone.startsWith("+")
            ? guest.cellphone
            : `+972${guest.cellphone}`;

          const contentVariables = populateVariables(
            guest,
            wedding || { id: "" }
          );

          // Import the savePersonalWhatsAppMessage function
          const { savePersonalWhatsAppMessage } = await import(
            "../../api/rsvp/rsvpApi"
          );

          await savePersonalWhatsAppMessage(
            selectedTemplate.sid,
            contentVariables,
            guest.id,
            cleanNumber,
            wedding?.id
          );
        } catch (error) {
          console.error(
            `Error saving personal WhatsApp message for ${guest.name}:`,
            error
          );
        }
      }
    }
    handleActualClose();
  };

  const handleCloseWithoutSaving = () => {
    handleActualClose();
  };

  const handleCloseDialogCancel = () => {
    setShowCloseDialog(false);
  };

  const handleGuestClicked = (guestId: string) => {
    setClickedGuests((prev) => new Set(prev).add(guestId));
  };

  const handlePersonalMessageSent = async (guestId: string) => {
    setClickedGuests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(guestId);
      return newSet;
    });
  };

  return (
    <>
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
            <Typography variant="h6">{`${t("rsvp.sendMessage")} (${
              selectedTemplate?.friendlyName
            })`}</Typography>
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
            {/* Message Type Selection */}
            <MessageTypeToggle
              value={messageType}
              onChange={setMessageType}
              disabled={sending}
            />
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
            <Divider />

            {/* Personal WhatsApp List - Show when personal WhatsApp is selected and template is chosen */}
            {messageType === "personal-whatsapp" && selectedTemplate ? (
              <PersonalWhatsAppList
                guests={selectedGuests}
                template={selectedTemplate}
                onGuestSent={handlePersonalMessageSent}
                onGuestClicked={handleGuestClicked}
                clickedGuests={clickedGuests}
              />
            ) : (
              <>
                {/* Message preview for other message types */}
                <MessagePreview
                  template={selectedTemplate || null}
                  messageType={messageType}
                  guests={selectedGuests}
                  wedding={wedding}
                />

                {/* Warning for multiple recipients */}
                {selectedGuests.length > 1 && (
                  <Alert severity="info">
                    {t("rsvp.bulkSendWarning", {
                      count: selectedGuests.length,
                    })}
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={sending} variant="outlined">
            {messageType === "personal-whatsapp"
              ? t("common.done")
              : t("common.cancel")}
          </Button>

          {/* Only show Send button for API-based messaging, not for personal WhatsApp */}
          {messageType !== "personal-whatsapp" && (
            <Button
              onClick={handleSend}
              disabled={
                !selectedTemplate || selectedGuests.length === 0 || sending
              }
              variant="contained"
              startIcon={
                sending ? <CircularProgress size={20} /> : <SendIcon />
              }
            >
              {sending
                ? t("rsvp.sending")
                : `${t("common.send")} ${
                    messageType === "whatsapp"
                      ? t("common.whatsapp")
                      : t("common.sms")
                  } (${selectedGuests.length})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Close confirmation dialog for Personal WhatsApp */}
      <PersonalWhatsAppCloseDialog
        open={showCloseDialog}
        clickedGuests={selectedGuests.filter((guest) =>
          clickedGuests.has(guest.id)
        )}
        onClose={handleCloseDialogCancel}
        onMarkAsSentAndClose={handleMarkAsSentAndClose}
        onCloseWithoutSaving={handleCloseWithoutSaving}
      />
    </>
  );
};

export default SendMessageDialog;
