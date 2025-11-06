import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface InviteProducerDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: string, language: "en" | "he") => void;
  isLoading: boolean;
  error?: string | null;
}

export const InviteProducerDialog: React.FC<InviteProducerDialogProps> = ({
  open,
  onClose,
  onSend,
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"en" | "he">("he");
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = () => {
    setEmailError(null);

    if (!email.trim()) {
      setEmailError(t("common.fieldRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("invitations.invalidEmail"));
      return;
    }

    onSend(email, language);
  };

  const handleClose = () => {
    setEmail("");
    setLanguage("he");
    setEmailError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Email color="primary" />
          <span>{t("invitations.inviteProducer")}</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("invitations.inviteProducerDescription")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label={t("invitations.emailAddress")}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            error={!!emailError}
            helperText={emailError}
            disabled={isLoading}
            placeholder="producer@example.com"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth disabled={isLoading}>
            <InputLabel>{t("invitations.language")}</InputLabel>
            <Select
              value={language}
              label={t("invitations.language")}
              onChange={(e) => setLanguage(e.target.value as "en" | "he")}
            >
              <MenuItem value="he">עברית (Hebrew)</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "primary.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "primary.light",
            }}
          >
            <Typography variant="subtitle2" color="primary.dark" gutterBottom>
              {t("invitations.whatHappensNext")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {t("invitations.whatHappensNextItems.emailSent")}
              <br />
              • {t("invitations.whatHappensNextItems.signupOptions")}
              <br />
              • {t("invitations.whatHappensNextItems.emailMatch")}
              <br />• {t("invitations.whatHappensNextItems.autoAccess")}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={isLoading || !email.trim()}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Email />}
        >
          {isLoading ? t("invitations.sending") : t("invitations.sendInvitation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
