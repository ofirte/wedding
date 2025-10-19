import React, { useState, useEffect, useRef } from "react";
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
  useManualUpdateAutomationStatuses,
  useTemplates,
} from "../../hooks/rsvp";
import SendAutomationsEmptyState from "./SendAutomationsEmptyState";
import CreateAutomationDialog from "./CreateAutomationDialog";
import SendAutomationsTable from "./SendAutomationsTable";
import AutomationInfoDialog from "./AutomationInfoDialog";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * SendAutomationsManager - Main component for managing automated message campaigns
 *
 * Tells the story: "Manage your automated message campaigns"
 */
const SendAutomationsManager: React.FC = () => {
  const { t } = useTranslation();
  const { data: automations = [], isLoading, refetch } = useSendAutomations();
  const { data: templatesData } = useTemplates();
  const deleteAutomation = useDeleteSendAutomation();
  const manualRunAutomations = useManualRunAutomations();
  const manualUpdateAutomationStatuses = useManualUpdateAutomationStatuses();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<SendMessagesAutomation | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const hasRunInitialCheck = useRef(false);
  const isCheckingStatuses = useRef(false);

  // Run automation status check only once when component mounts
  useEffect(() => {
    if (!hasRunInitialCheck.current && !isCheckingStatuses.current) {
      const checkAutomationStatuses = async () => {
        try {
          console.log("Starting automation status check on mount...");
          isCheckingStatuses.current = true;
          await manualUpdateAutomationStatuses.mutateAsync();
          console.log("Automation status check completed, refreshing list...");
          // Refresh the automations list after status update
          refetch();
        } catch (error) {
          console.error("Error checking automation statuses on mount:", error);
        } finally {
          isCheckingStatuses.current = false;
        }
      };

      hasRunInitialCheck.current = true;
      checkAutomationStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - truly run only once on mount

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

  const handleRowClick = (automation: SendMessagesAutomation) => {
    setSelectedAutomation(automation);
    setIsInfoDialogOpen(true);
  };

  const handleCloseInfoDialog = () => {
    setIsInfoDialogOpen(false);
    setSelectedAutomation(null);
  };

  // Create template names mapping
  const templateNames = React.useMemo(() => {
    if (!templatesData?.templates) return {};
    
    const mapping: Record<string, string> = {};
    templatesData.templates.forEach(template => {
      mapping[template.sid] = template.friendlyName;
    });
    return mapping;
  }, [templatesData?.templates]);

  // Get template name for selected automation
  const selectedTemplateName = selectedAutomation 
    ? templateNames[selectedAutomation.messageTemplateId] 
    : undefined;

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
            onRowClick={handleRowClick}
            templateNames={templateNames}
          />
        </Paper>
      )}

      <CreateAutomationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <AutomationInfoDialog
        open={isInfoDialogOpen}
        onClose={handleCloseInfoDialog}
        automation={selectedAutomation}
        templateName={selectedTemplateName}
      />
    </Box>
  );
};

export default SendAutomationsManager;
