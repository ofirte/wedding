import React, { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  useSendAutomations,
  useDeleteSendAutomation,
  useManualRunAutomations,
} from "../../hooks/rsvp";
import SendAutomationsEmptyState from "./SendAutomationsEmptyState";
import CreateAutomationDialog from "./CreateAutomationDialog";
import SendAutomationsTable from "./SendAutomationsTable";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * SendAutomationsManager - Main component for managing automated message campaigns
 *
 * Tells the story: "Manage your automated message campaigns"
 */
const SendAutomationsManager: React.FC = () => {
  const { t } = useTranslation();
  const { data: automations = [], isLoading, refetch } = useSendAutomations();
  const deleteAutomation = useDeleteSendAutomation();
  const manualRunAutomations = useManualRunAutomations();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateSuccess = () => {
    refetch(); // Refresh the list after creating
  };

  const handleManualRun = async () => {
    try {
      await manualRunAutomations.mutateAsync();
      refetch(); // Refresh the list after running
    } catch (error) {
      console.error("Error running automations manually:", error);
    }
  };

  const handleDelete = async (automation: SendMessagesAutomation) => {
    if (window.confirm(t("common.confirmDelete"))) {
      try {
        await deleteAutomation.mutateAsync(automation.id);
        refetch(); // Refresh the list after deleting
      } catch (error) {
        console.error("Error deleting automation:", error);
      }
    }
  };

  const handleEdit = (automation: SendMessagesAutomation) => {
    // TODO: Implement edit functionality
    console.log("Edit automation:", automation);
  };

  const hasAutomations = automations.length > 0;

  if (isLoading) {
    return <Typography>Loading automations...</Typography>;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">{t("rsvp.sendAutomations")}</Typography>
        {hasAutomations && (
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={handleManualRun}
              disabled={manualRunAutomations.isPending}
            >
              {manualRunAutomations.isPending
                ? t("common.loading")
                : t("rsvp.runNow")}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              {t("rsvp.createAutomation")}
            </Button>
          </Box>
        )}
      </Box>

      {!hasAutomations ? (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={handleManualRun}
              disabled={manualRunAutomations.isPending}
              size="small"
            >
              {manualRunAutomations.isPending
                ? t("common.loading")
                : t("rsvp.runNow")}
            </Button>
          </Box>
          <SendAutomationsEmptyState
            onCreateClick={() => setIsDialogOpen(true)}
          />
        </Box>
      ) : (
        <Paper>
          <SendAutomationsTable
            automations={automations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Paper>
      )}

      <CreateAutomationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
};

export default SendAutomationsManager;
