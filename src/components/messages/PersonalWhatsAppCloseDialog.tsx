import { FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface PersonalWhatsAppCloseDialogProps {
  open: boolean;
  clickedGuests: Invitee[];
  onClose: () => void;
  onMarkAsSentAndClose: (guestIds: string[]) => void;
  onCloseWithoutSaving: () => void;
}

/**
 * PersonalWhatsAppCloseDialog - Confirmation dialog when leaving personal WhatsApp flow
 * Shows guests that were clicked but not marked as sent, with options to mark them or leave
 */
const PersonalWhatsAppCloseDialog: FC<PersonalWhatsAppCloseDialogProps> = ({
  open,
  clickedGuests,
  onClose,
  onMarkAsSentAndClose,
  onCloseWithoutSaving,
}) => {
  const { t } = useTranslation();
  // Filter to only show guests that were clicked but not already marked as sent
  const pendingGuests = clickedGuests;

  const handleMarkAsSentAndClose = () => {
    const guestIds = pendingGuests.map((guest) => guest.id);
    onMarkAsSentAndClose(guestIds);
  };

  const handleStay = () => {
    onClose();
  };

  const handleLeaveWithoutSaving = () => {
    onCloseWithoutSaving();
  };

  // If no pending guests, just close normally
  if (pendingGuests.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <WhatsAppIcon color="success" />
          <Typography variant="h6">{t("rsvp.markMessagesAsSent")}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            {t("rsvp.clickedSendButNotMarked", { count: pendingGuests.length })}
          </Alert>

          <Typography variant="body1" gutterBottom>
            {t("rsvp.whichGuestsDidYouSendTo")}
          </Typography>

          {/* List of pending guests */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("rsvp.pendingGuests")}
            </Typography>
            <Stack spacing={1}>
              {pendingGuests.map((guest) => (
                <Chip
                  key={guest.id}
                  label={`${guest.name} (${guest.cellphone})`}
                  icon={<PersonIcon />}
                  variant="outlined"
                  sx={{
                    justifyContent: "flex-start",
                    "& .MuiChip-label": {
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleStay} variant="outlined" color="primary">
          {t("rsvp.stayContinue")}
        </Button>

        <Button
          onClick={handleLeaveWithoutSaving}
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
        >
          {t("rsvp.leaveWithoutSaving")}
        </Button>

        <Button
          onClick={handleMarkAsSentAndClose}
          variant="contained"
          color="success"
          startIcon={<CheckIcon />}
        >
          {t("rsvp.markAllAsSentAndClose")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PersonalWhatsAppCloseDialog;
