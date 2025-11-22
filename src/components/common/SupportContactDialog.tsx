import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { HelpOutline, Send } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useAuth } from "../../hooks/auth/AuthContext";
import { useSendSupportContact } from "../../hooks/common/useSendSupportContact";

interface SupportContactDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SupportContactDialog: React.FC<SupportContactDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill user info from auth
  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
    }
  }, [open, currentUser]);

  const { mutate: sendSupport, isPending, error } = useSendSupportContact({
    onSuccess: () => {
      setShowSuccess(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    },
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = t("support.fieldRequired");
    }

    if (!email.trim()) {
      newErrors.email = t("support.fieldRequired");
    } else if (!validateEmail(email)) {
      newErrors.email = t("support.invalidEmail");
    }

    if (!subject.trim()) {
      newErrors.subject = t("support.fieldRequired");
    } else if (subject.length > 200) {
      newErrors.subject = t("support.subjectTooLong");
    }

    if (!message.trim()) {
      newErrors.message = t("support.fieldRequired");
    } else if (message.length < 10) {
      newErrors.message = t("support.messageTooShort");
    } else if (message.length > 1000) {
      newErrors.message = t("support.messageTooLong");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validateForm()) {
      return;
    }

    sendSupport({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
  };

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  const handleFieldChange = (
    field: keyof typeof errors,
    value: string
  ) => {
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "subject":
        setSubject(value);
        break;
      case "message":
        setMessage(value);
        break;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HelpOutline color="primary" />
          <span>{t("support.title")}</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("support.description")}
          </Typography>

          {showSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t("support.successMessage")}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("support.errorMessage")}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t("support.nameLabel")}
            value={name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isPending || showSuccess}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t("support.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isPending || showSuccess}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t("support.subjectLabel")}
            value={subject}
            onChange={(e) => handleFieldChange("subject", e.target.value)}
            error={!!errors.subject}
            helperText={errors.subject}
            disabled={isPending || showSuccess}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 200 }}
          />

          <TextField
            fullWidth
            label={t("support.messageLabel")}
            placeholder={t("support.messagePlaceholder")}
            value={message}
            onChange={(e) => handleFieldChange("message", e.target.value)}
            error={!!errors.message}
            helperText={errors.message}
            disabled={isPending || showSuccess}
            multiline
            rows={6}
            inputProps={{ maxLength: 1000 }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block", textAlign: "right" }}
          >
            {message.length}/1000
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isPending || showSuccess}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={
            isPending ||
            showSuccess ||
            !name.trim() ||
            !email.trim() ||
            !subject.trim() ||
            !message.trim()
          }
          startIcon={isPending ? <CircularProgress size={16} /> : <Send />}
        >
          {isPending ? t("common.sending") : t("support.sendButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
