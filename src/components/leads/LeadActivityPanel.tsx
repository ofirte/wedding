import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  Lead,
  LeadStatusColors,
} from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useLeadEvents } from "../../hooks/leads";
import { createLeadEvent } from "../../api/leads/leadsApi";
import { formatDistanceToNow } from "date-fns";
import { formatLeadEventDescription } from "../../utils/leadEventFormatter";

interface LeadActivityPanelProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const LeadActivityPanel: React.FC<LeadActivityPanelProps> = ({
  lead,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useLeadEvents(lead?.id || "", open && !!lead);

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      await createLeadEvent(lead.id, {
        type: "note_added",
        description: newNote.trim(),
      });
      setNewNote("");
      refetch();
    } catch (error) {
      console.error("Error adding note:", error);
      alert(t("leads.messages.errorAddingNote"));
    } finally {
      setIsAddingNote(false);
    }
  };

  if (!lead) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 } },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">{t("leads.activityPanel.leadDetails")}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Lead Information */}
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {lead.name}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={t(`leads.statuses.${lead.status}`)}
              size="small"
              sx={{
                backgroundColor: LeadStatusColors[lead.status],
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("leads.columns.email")}
              </Typography>
              <Typography variant="body2">{lead.email}</Typography>
            </Box>

            {lead.phone && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.phone")}
                </Typography>
                <Typography variant="body2">{lead.phone}</Typography>
              </Box>
            )}

            {lead.weddingDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.weddingDate")}
                </Typography>
                <Typography variant="body2">
                  {new Date(lead.weddingDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {lead.budget && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.budget")}
                </Typography>
                <Typography variant="body2">
                  ${lead.budget.toLocaleString()}
                </Typography>
              </Box>
            )}

            {lead.estimatedGuests && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.estimatedGuests")}
                </Typography>
                <Typography variant="body2">{lead.estimatedGuests}</Typography>
              </Box>
            )}

            {lead.source && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.source")}
                </Typography>
                <Typography variant="body2">
                  {t(`leads.sources.${lead.source}`)}
                </Typography>
              </Box>
            )}

            {lead.service && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.service")}
                </Typography>
                <Typography variant="body2">{lead.service}</Typography>
              </Box>
            )}

            {lead.followUpDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.followUp")}
                </Typography>
                <Typography variant="body2">
                  {new Date(lead.followUpDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {lead.notes && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("leads.columns.notes")}
                </Typography>
                <Typography variant="body2">{lead.notes}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Add Note Section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("leads.activityPanel.addNote")}
          </Typography>
          <TextField
            placeholder={t("leads.activityPanel.addNotePlaceholder")}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
            disabled={isAddingNote}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddNote}
            disabled={!newNote.trim() || isAddingNote}
            sx={{ mt: 1 }}
          >
            {t("leads.activityPanel.addNote")}
          </Button>
        </Box>

        <Divider />

        {/* Activity Timeline */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("leads.activityPanel.activityTimeline")}
          </Typography>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {t("leads.messages.errorLoading")}
            </Alert>
          )}

          {!isLoading && !error && events.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t("leads.activityPanel.noActivity")}
            </Typography>
          )}

          {!isLoading && !error && events.length > 0 && (
            <List dense>
              {events
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((event) => (
                  <ListItem key={event.id} alignItems="flex-start">
                    <ListItemText
                      primary={formatLeadEventDescription(
                        event,
                        t,
                        (status) => t(`leads.statuses.${status}`)
                      )}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {event.userName}
                          </Typography>
                          {" • "}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(new Date(event.timestamp), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default LeadActivityPanel;
