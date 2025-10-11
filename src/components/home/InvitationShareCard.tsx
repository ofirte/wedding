import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Stack,
  Divider,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { useTranslation } from "../../localization/LocalizationContext";

interface InvitationShareCardProps {
  isModal?: boolean;
}

const InvitationShareCard: React.FC<InvitationShareCardProps> = ({
  isModal = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: weddingDetails } = useWeddingDetails();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Generate invitation link
  const baseUrl = window.location.origin;
  const invitationCode = weddingDetails?.invitationCode;
  const invitationLink = invitationCode
    ? `${baseUrl}/login?invite=${invitationCode}`
    : "";

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage(successMessage);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `You're invited to ${weddingDetails?.name || "our wedding"}!`
    );
    const body = encodeURIComponent(
      `Hi! You're invited to join our wedding planning. Use this link to get started: ${invitationLink}\n\nOr use invitation code: ${invitationCode}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! You're invited to join our wedding planning for ${
        weddingDetails?.name || "our wedding"
      }. Use this link: ${invitationLink} or invitation code: ${invitationCode}`
    );
    window.open(`https://wa.me/?text=${message}`);
  };

  if (!weddingDetails || !invitationCode) {
    return null;
  }

  return (
    <>
      <Paper
        elevation={isModal ? 0 : 2}
        sx={{
          p: 3,
          mb: isModal ? 0 : 4,
          borderRadius: isModal ? 0 : 3,
          background: isModal
            ? "transparent"
            : `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
          color: isModal ? theme.palette.text.primary : "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements - only show when not in modal */}
        {!isModal && (
          <>
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            />
          </>
        )}

        <Box sx={{ position: "relative", zIndex: 1 }}>
          {!isModal && (
            <Box display="flex" alignItems="center" mb={2}>
              <ShareIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                {t("common.inviteOthers")}
              </Typography>
            </Box>
          )}

          {!isModal && (
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              {t("common.shareInvitationDescription")}
            </Typography>
          )}

          <Stack spacing={3}>
            {/* Invitation Code */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                {t("common.invitationCodeLabel")}
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  value={invitationCode}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: isModal
                        ? "background.paper"
                        : "rgba(255, 255, 255, 0.9)",
                      "& .MuiInputBase-input": {
                        color: theme.palette.text.primary,
                        fontWeight: "medium",
                        fontSize: "1.1rem",
                      },
                    },
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  onClick={() =>
                    copyToClipboard(
                      invitationCode,
                      t("common.invitationCodeCopied")
                    )
                  }
                  sx={{
                    bgcolor: isModal
                      ? "background.paper"
                      : "rgba(255, 255, 255, 0.9)",
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: isModal
                        ? "action.hover"
                        : "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <CopyIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Invitation Link */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                {t("common.invitationLink")}
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  value={invitationLink}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: isModal
                        ? "background.paper"
                        : "rgba(255, 255, 255, 0.9)",
                      "& .MuiInputBase-input": {
                        color: theme.palette.text.primary,
                        fontSize: "0.875rem",
                      },
                    },
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  onClick={() =>
                    copyToClipboard(
                      invitationLink,
                      t("common.invitationLinkCopied")
                    )
                  }
                  sx={{
                    bgcolor: isModal
                      ? "background.paper"
                      : "rgba(255, 255, 255, 0.9)",
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: isModal
                        ? "action.hover"
                        : "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <CopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider
              sx={{
                borderColor: isModal ? "divider" : "rgba(255, 255, 255, 0.3)",
              }}
            />

            {/* Share Buttons */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                Quick Share
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={shareViaEmail}
                  sx={{
                    bgcolor: isModal
                      ? theme.palette.primary.main
                      : "rgba(255, 255, 255, 0.9)",
                    color: isModal ? "white" : theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: isModal
                        ? theme.palette.primary.dark
                        : "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  {t("common.shareViaEmail")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  onClick={shareViaWhatsApp}
                  sx={{
                    bgcolor: "#25D366",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#20B85A",
                    },
                  }}
                >
                  {t("common.shareViaWhatsApp")}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InvitationShareCard;
