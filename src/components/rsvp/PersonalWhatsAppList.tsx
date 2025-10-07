import React, { FC, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { Invitee } from "../invitees/InviteList";
import { usePersonalWhatsApp } from "../../hooks/rsvp/usePersonalWhatsApp";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { savePersonalWhatsAppMessage } from "../../api/rsvp/rsvpApi";

interface Template {
  sid: string;
  friendlyName?: string;
  types?: Record<string, any>;
}

interface PersonalWhatsAppListProps {
  guests: Invitee[];
  template: Template;
  onGuestSent: (guestId: string) => void;
  onGuestClicked?: (guestId: string) => void;
  clickedGuests?: Set<string>;
}

/**
 * PersonalWhatsAppList - Shows individual guest cards for personal WhatsApp sending
 */
const PersonalWhatsAppList: FC<PersonalWhatsAppListProps> = ({
  guests,
  template,
  onGuestSent,
  onGuestClicked,
  clickedGuests = new Set(),
}) => {
  const { data: wedding } = useWeddingDetails();
  const { generateWhatsAppURL, generatePersonalizedMessage, cleanPhoneNumber } =
    usePersonalWhatsApp();
  const [sentGuests, setSentGuests] = useState<Set<string>>(new Set());
  const [sendingGuests, setSendingGuests] = useState<Set<string>>(new Set());

  const handleSendMessage = async (guest: Invitee) => {
    setSendingGuests((prev) => new Set(prev).add(guest.id));

    try {
      // Generate personalized message
      const message = generatePersonalizedMessage(template, guest, wedding);

      // Generate WhatsApp URL
      const whatsappURL = generateWhatsAppURL(guest, message);

      // Track that this guest was clicked
      onGuestClicked?.(guest.id);

      // Open WhatsApp
      window.open(whatsappURL, "_blank");

      // Note: We don't automatically mark as sent here - user needs to confirm
    } catch (error) {
      console.error(`Error opening WhatsApp for ${guest.name}:`, error);
    } finally {
      setSendingGuests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(guest.id);
        return newSet;
      });
    }
  };

  const handleMarkAsSent = async (guest: Invitee) => {
    try {
      // Save to Firebase
      const cleanNumber = cleanPhoneNumber(guest.cellphone);
      const contentVariables = {
        guestName: guest.name,
        guestId: guest.id,
        weddingId: wedding?.id ?? "",
      };

      await savePersonalWhatsAppMessage(
        template.sid,
        contentVariables,
        guest.id,
        cleanNumber,
        wedding?.id
      );

      // Update UI
      setSentGuests((prev) => new Set(prev).add(guest.id));
      onGuestSent(guest.id);
    } catch (error) {
      console.error(`Error marking message as sent for ${guest.name}:`, error);
      setSentGuests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(guest.id);
        return newSet;
      });
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        Personal WhatsApp Messages ({guests.length} guests)
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Click "Send Message" to open WhatsApp with the pre-filled message, then
        click "Mark as Sent" after sending.
      </Typography>

      {guests.map((guest) => {
        const isSent = sentGuests.has(guest.id);
        const isSending = sendingGuests.has(guest.id);
        const isClicked = clickedGuests.has(guest.id);

        return (
          <Card
            key={guest.id}
            variant="outlined"
            sx={{
              bgcolor: isSent
                ? "success.light"
                : isClicked
                ? "warning.light"
                : "background.paper",
              opacity: isSent ? 0.7 : 1,
              borderColor: isClicked && !isSent ? "warning.main" : undefined,
              borderWidth: isClicked && !isSent ? 2 : 1,
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* Guest Info */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{ bgcolor: isSent ? "success.main" : "primary.main" }}
                  >
                    {isSent ? <CheckIcon /> : <PersonIcon />}
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {guest.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {guest.cellphone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Status & Actions */}
                <Box display="flex" alignItems="center" gap={1}>
                  {isClicked && (
                    <Chip
                      label="Clicked"
                      color="warning"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => handleSendMessage(guest)}
                    disabled={isSending}
                    sx={{
                      color: "#25d366",
                      borderColor: "#25d366",
                      "&:hover": {
                        bgcolor: "#25d366",
                        color: "white",
                      },
                    }}
                  >
                    Send Message
                  </Button>
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => handleMarkAsSent(guest)}
                      disabled={isSending}
                    >
                      Mark as Sent
                    </Button>
                  </>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

export default PersonalWhatsAppList;
