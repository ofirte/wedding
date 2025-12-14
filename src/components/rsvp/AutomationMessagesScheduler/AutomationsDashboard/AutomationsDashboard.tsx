import React, { useState, useMemo } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "../../../../localization/LocalizationContext";
import {
  useSendAutomations,
  useUpdateSendAutomation,
} from "../../../../hooks/rsvp";
import { useAllWeddingAvailableTemplates } from "../../../../hooks/templates/useAllWeddingAvailableTemplates";
import { useWeddingDetails } from "../../../../hooks/wedding/useWeddingDetails";
import { getWeddingDayOffset } from "../../../../utils/weddingDateUtils";
import { SendMessagesAutomation, TemplateDocument } from "@wedding-plan/types";
import { enUS, he } from "date-fns/locale";
import { PendingChanges } from "./types";
import { AutomationDashboardCard } from "./AutomationDashboardCard";

const AutomationsDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const { data: automations = [], isLoading: isLoadingAutomations } =
    useSendAutomations();
  const { data: templates = [], isLoading: isLoadingTemplates } =
    useAllWeddingAvailableTemplates();
  const { data: wedding } = useWeddingDetails();

  const { mutate: updateAutomation } = useUpdateSendAutomation();

  // Track which automation is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  // Track pending changes (not saved yet)
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Sort automations by scheduled time
  const sortedAutomations = useMemo(() => {
    return [...automations].sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime()
    );
  }, [automations]);

  // Get template by ID
  const getTemplateById = (templateId: string): TemplateDocument | undefined => {
    return templates.find((t) => t.id === templateId);
  };

  // Get offset text for scheduled time
  const getOffsetText = (scheduledTime: Date) => {
    if (!wedding?.date) return "";
    return getWeddingDayOffset(new Date(scheduledTime), wedding.date, t);
  };

  // Handle starting edit mode
  const handleStartEdit = (automationId: string) => {
    setEditingId(automationId);
  };

  // Handle canceling edit
  const handleCancelEdit = (automationId: string) => {
    setEditingId(null);
    // Remove pending changes for this automation
    const newChanges = { ...pendingChanges };
    delete newChanges[automationId];
    setPendingChanges(newChanges);
  };

  // Handle time change (store in pending)
  const handleTimeChange = (automationId: string, newTime: Date | null) => {
    if (!newTime) return;
    setPendingChanges((prev) => ({
      ...prev,
      [automationId]: {
        ...prev[automationId],
        scheduledTime: newTime,
      },
    }));
  };

  // Handle template change (store in pending)
  const handleTemplateChange = (automationId: string, templateId: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [automationId]: {
        ...prev[automationId],
        messageTemplateId: templateId,
      },
    }));
  };

  // Save changes for a single automation
  const handleSaveChanges = (automationId: string) => {
    const changes = pendingChanges[automationId];
    if (!changes) return;

    updateAutomation({
      id: automationId,
      ...(changes.scheduledTime && { scheduledTime: changes.scheduledTime }),
      ...(changes.messageTemplateId && {
        messageTemplateId: changes.messageTemplateId,
      }),
    });

    // Clear pending changes for this automation and exit edit mode
    const newChanges = { ...pendingChanges };
    delete newChanges[automationId];
    setPendingChanges(newChanges);
    setEditingId(null);
  };

  // Get the effective value (pending change or current value)
  const getEffectiveTime = (automation: SendMessagesAutomation): Date => {
    return (
      pendingChanges[automation.id]?.scheduledTime ||
      new Date(automation.scheduledTime)
    );
  };

  const getEffectiveTemplateId = (automation: SendMessagesAutomation): string => {
    return (
      pendingChanges[automation.id]?.messageTemplateId ||
      automation.messageTemplateId
    );
  };

  if (isLoadingAutomations || isLoadingTemplates) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {t("rsvp.scheduledMessages") || "Scheduled Messages"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("rsvp.scheduledMessagesDescription") ||
              "View and manage your scheduled automated messages."}
          </Typography>
        </Box>

        {/* Automations List */}
        <Stack spacing={2}>
          {sortedAutomations.map((automation) => {
            const effectiveTemplateId = getEffectiveTemplateId(automation);
            const template = getTemplateById(effectiveTemplateId);
            const effectiveTime = getEffectiveTime(automation);
            const offsetText = getOffsetText(effectiveTime);
            const isEditing = editingId === automation.id;
            const hasPendingChange = !!pendingChanges[automation.id];

            // Get all templates for this category
            const categoryTemplates = templates.filter(
              (t) =>
                t.category === automation.relatedTemplateCategory &&
                t.sid &&
                (t.types?.["twilio/text"]?.body || t.friendlyName)
            );

            return (
              <AutomationDashboardCard
                key={automation.id}
                automation={automation}
                template={template}
                availableTemplates={categoryTemplates}
                effectiveTime={effectiveTime}
                offsetText={offsetText}
                isEditing={isEditing}
                hasPendingChange={hasPendingChange}
                onStartEdit={() => handleStartEdit(automation.id)}
                onCancelEdit={() => handleCancelEdit(automation.id)}
                onSaveChanges={() => handleSaveChanges(automation.id)}
                onTimeChange={(newTime) =>
                  handleTimeChange(automation.id, newTime)
                }
                onTemplateChange={(templateId) =>
                  handleTemplateChange(automation.id, templateId)
                }
                locale={locale}
                t={t}
              />
            );
          })}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default AutomationsDashboard;
