import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Phone,
  Person,
  Search,
  ContactPhone,
  Close,
} from "@mui/icons-material";
import { Invitee } from "@wedding-plan/types";
import { useGoogleContacts } from "../../hooks/contacts/useGoogleContacts";
import { useContactMatcher } from "../../hooks/contacts/useContactMatcher";
import {
  GoogleContact,
  isGoogleContactsConfigured,
} from "../../api/contacts/googleContactsApi";
import { displayPhoneNumber } from "../../utils/PhoneUtils";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  getContactDisplayName,
  getContactPhoneNumber,
} from "../../api/contacts/googleContactUtils";

interface ContactMatcherProps {
  open: boolean;
  onClose: () => void;
  invitees: Invitee[];
  onComplete?: () => void;
}

const ContactMatcher: React.FC<ContactMatcherProps> = ({
  open,
  onClose,
  invitees,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<GoogleContact[]>([]);
  const [lastInviteeIndex, setLastInviteeIndex] = useState<number>(-1);

  const {
    contacts,
    isLoading: contactsLoading,
    error: contactsError,
    hasAccess,
    requestAccess,
    loadContacts,
    searchContacts,
    clearError,
  } = useGoogleContacts();

  const {
    currentInviteeIndex,
    currentMatch,
    isCompleted,
    progress,
    startMatching,
    selectContact,
    confirmMatch,
    skipInvitee,
    goToNext,
    goToPrevious,
    reset,
  } = useContactMatcher();

  // Filter invitees that need phone numbers
  const inviteesNeedingPhones = invitees.filter(
    (invitee) => !invitee.cellphone || invitee.cellphone.trim() === ""
  );

  // Initialize matching when dialog opens
  useEffect(() => {
    if (open && inviteesNeedingPhones.length > 0) {
      startMatching(invitees);
    }
  }, [open, invitees.length, startMatching]);

  // Update search term only when switching to a new invitee (not while editing)
  useEffect(() => {
    if (currentMatch && currentInviteeIndex !== lastInviteeIndex) {
      setSearchTerm(currentMatch.invitee.name || "");
      setLastInviteeIndex(currentInviteeIndex);
    }
  }, [currentMatch, currentInviteeIndex, lastInviteeIndex]);

  // Update filtered contacts when search term or contacts change
  useEffect(() => {
    if (contacts.length > 0) {
      const filtered = searchContacts(searchTerm);
      setFilteredContacts(filtered);
    }
  }, [contacts, searchTerm, searchContacts]);

  const handleRequestAccess = async () => {
    clearError();
    const success = await requestAccess();
    if (success) {
      await loadContacts();
    }
  };

  const handleContactSelect = (contact: GoogleContact) => {
    selectContact(contact);
  };

  const handleConfirmMatch = async () => {
    try {
      await confirmMatch();
    } catch (error) {
      console.error("Error confirming match:", error);
    }
  };

  const handleSkip = () => {
    skipInvitee();
    // The search term will be automatically updated when the next invitee loads
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    handleClose();
  };

  // Don't show dialog if there are no invitees needing phone numbers
  if (inviteesNeedingPhones.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ContactPhone color="primary" />
            {t("contacts.noInviteesNeedPhone")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            All your invitees already have phone numbers assigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("contacts.close")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Don't show dialog if Google Contacts is not configured
  if (!isGoogleContactsConfigured()) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ContactPhone color="warning" />
            Configuration Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Google Contacts integration is not configured.
            </Typography>
          </Alert>
          <Typography>
            To use the contact matching feature, you need to set up Google OAuth
            credentials. Please check the GOOGLE_CONTACTS_SETUP.md file in the
            project root for detailed setup instructions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("contacts.close")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: "80vh" } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ContactPhone color="primary" />
            <Typography variant="h6">{t("contacts.matchContacts")}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Progress bar */}
        {!isCompleted && (
          <Box mt={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" color="text.secondary">
                {t("contacts.progressLabel", {
                  current: progress.current,
                  total: progress.total,
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((progress.current / progress.total) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
            />
          </Box>
        )}
      </DialogTitle>

      <DialogContent>
        {contactsError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {contactsError}
          </Alert>
        )}

        {/* Request access if not granted */}
        {!hasAccess && (
          <Paper sx={{ p: 3, textAlign: "center", mb: 2 }}>
            <ContactPhone
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {t("contacts.accessRequired")}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {t("contacts.accessDescription")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ContactPhone />}
              onClick={handleRequestAccess}
              disabled={contactsLoading}
            >
              {contactsLoading
                ? t("contacts.loading")
                : t("contacts.grantAccess")}
            </Button>
          </Paper>
        )}

        {/* Completed state */}
        {isCompleted && (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <ContactPhone sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("contacts.matchingComplete")}
            </Typography>
            <Typography color="text.secondary">
              {t("contacts.completedDescription")}
            </Typography>
          </Paper>
        )}

        {/* Matching interface */}
        {hasAccess && !isCompleted && currentMatch && (
          <Box>
            {/* Current invitee info */}
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Person />
                <Typography variant="h6">
                  {currentMatch.invitee.name}
                </Typography>
              </Box>
              <Typography variant="body2">
                {t("contacts.currentlyMatching")}
              </Typography>
            </Paper>

            {/* Search input */}
            <TextField
              fullWidth
              label={t("contacts.searchContacts")}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ mb: 2 }}
              helperText={`${filteredContacts.length} contacts found (${contacts.length} total)`}
              placeholder="Edit name or type to search contacts..."
            />

            {/* Selected contact preview */}
            {currentMatch.selectedContact && (
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {t("contacts.selectedContact")}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person />
                  <Typography variant="body1">
                    {getContactDisplayName(currentMatch.selectedContact)}
                  </Typography>
                  {currentMatch.phoneNumber && (
                    <Chip
                      icon={<Phone />}
                      label={displayPhoneNumber(currentMatch.phoneNumber)}
                      size="small"
                      color="success"
                    />
                  )}
                </Box>
              </Paper>
            )}

            {/* Contacts list */}
            {contactsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
                <List>
                  {filteredContacts.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={t("contacts.noContactsFound")}
                        secondary={t("contacts.tryDifferentSearch")}
                      />
                    </ListItem>
                  ) : (
                    filteredContacts.map((contact, index) => {
                      const displayName = getContactDisplayName(contact);
                      const phoneNumber = getContactPhoneNumber(contact);
                      const isSelected =
                        currentMatch.selectedContact === contact;

                      return (
                        <ListItemButton
                          key={index}
                          selected={isSelected}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Person />
                                <Typography>{displayName}</Typography>
                              </Box>
                            }
                            secondary={
                              phoneNumber ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Phone fontSize="small" />
                                  <Typography variant="body2">
                                    {displayPhoneNumber(phoneNumber)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="error">
                                  {t("contacts.noPhoneNumber")}
                                </Typography>
                              )
                            }
                          />
                        </ListItemButton>
                      );
                    })
                  )}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={goToPrevious}
            disabled={currentInviteeIndex === 0 || isCompleted}
          >
            {t("contacts.previous")}
          </Button>

          {/* Center - Action buttons */}
          <Stack direction="row" spacing={1}>
            {isCompleted ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleComplete}
              >
                {t("contacts.done")}
              </Button>
            ) : hasAccess && currentMatch ? (
              <>
                <Button onClick={handleSkip}>{t("contacts.skip")}</Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmMatch}
                  disabled={
                    !currentMatch.selectedContact || !currentMatch.phoneNumber
                  }
                >
                  {t("contacts.confirmMatch")}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>{t("contacts.cancel")}</Button>
            )}
          </Stack>

          {/* Right side - Next button */}
          <Button
            endIcon={<ArrowForward />}
            onClick={goToNext}
            disabled={currentInviteeIndex >= progress.total - 1 || isCompleted}
          >
            {t("contacts.next")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ContactMatcher;
