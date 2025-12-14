import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface TermsDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  isProcessing: boolean;
}

const TermsDialog: React.FC<TermsDialogProps> = ({
  open,
  onClose,
  onAccept,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (!isProcessing) {
      setAccepted(false);
      setHasScrolledToBottom(false);
      onClose();
    }
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 20) {
        setHasScrolledToBottom(true);
      }
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="700">
          {t("rsvp.premiumPricing.termsDialog.title")}
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={isProcessing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column" }}>
        {/* Summary Section */}
        <Box
          sx={{
            mb: 2,
            mt: 2,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            {t("rsvp.premiumPricing.termsDialog.summary.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("rsvp.premiumPricing.termsDialog.summary.consent")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("rsvp.premiumPricing.termsDialog.summary.serviceDescription")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("rsvp.premiumPricing.termsDialog.summary.dataStorage")}
          </Typography>
        </Box>

        {/* Scrollable Terms Content */}
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            maxHeight: 300,
            overflowY: "auto",
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 2,
            p: 2,
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "grey.100",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "grey.400",
              borderRadius: 4,
              "&:hover": {
                backgroundColor: "grey.500",
              },
            },
          }}
        >
          {/* Terms of Service */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="700"
              color="primary.main"
              gutterBottom
            >
              {t("rsvp.premiumPricing.termsDialog.terms.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.intro")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section1.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section1.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section2.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section2.intro")}
            </Typography>
            <Box component="ul" sx={{ mb: 2, mt: 0 }}>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section2.item1")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section2.item2")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section2.item3")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section2.item4")}
                </Typography>
              </li>
            </Box>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section3.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section3.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section4.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section4.intro")}
            </Typography>
            <Box component="ul" sx={{ mb: 2, mt: 0 }}>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section4.item1")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section4.item2")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section4.item3")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.terms.section4.item4")}
                </Typography>
              </li>
            </Box>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section5.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section5.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section6.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section6.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section7.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section7.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section8.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section8.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section9.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section9.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section10.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.terms.section10.content")}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Privacy Policy */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="700"
              color="primary.main"
              gutterBottom
            >
              {t("rsvp.premiumPricing.termsDialog.privacy.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.intro")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section1.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section1.intro")}
            </Typography>
            <Box component="ul" sx={{ mb: 2, mt: 0 }}>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section1.item1")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section1.item2")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section1.item3")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section1.item4")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section1.item5")}
                </Typography>
              </li>
            </Box>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section2.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section2.intro")}
            </Typography>
            <Box component="ul" sx={{ mb: 2, mt: 0 }}>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section2.item1")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section2.item2")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section2.item3")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section2.item4")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("rsvp.premiumPricing.termsDialog.privacy.section2.item5")}
                </Typography>
              </li>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section2.noAds")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section3.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section3.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section4.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section4.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section5.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section5.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section6.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section6.content")}
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section7.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("rsvp.premiumPricing.termsDialog.privacy.section7.content")}
            </Typography>
          </Box>
        </Box>

        {/* Checkbox */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {!hasScrolledToBottom && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {t("rsvp.premiumPricing.termsDialog.scrollToAccept")}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                disabled={isProcessing || !hasScrolledToBottom}
                color="primary"
              />
            }
            label={
              <Typography
                variant="body2"
                color={hasScrolledToBottom ? "text.primary" : "text.disabled"}
              >
                {t("rsvp.premiumPricing.termsDialog.acceptCheckbox")}
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={handleClose} disabled={isProcessing}>
          {t("rsvp.premiumPricing.termsDialog.cancel")}
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={!accepted || isProcessing}
          startIcon={
            isProcessing ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : (
              <></>
            )
          }
          sx={{
            px: 4,
            fontWeight: 600,
          }}
        >
          {isProcessing
            ? t("rsvp.premiumPricing.termsDialog.processing")
            : t("rsvp.premiumPricing.termsDialog.proceed")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsDialog;
