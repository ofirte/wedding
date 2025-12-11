import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Collapse,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useTranslation } from "../../../localization/LocalizationContext";
import {
  useSendAutomations,
  useUpdateSendAutomation,
} from "../../../hooks/rsvp";
import { useAllWeddingAvailableTemplates } from "../../../hooks/templates/useAllWeddingAvailableTemplates";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import WhatsAppTemplatePreview from "../../templates/WhatsAppTemplatePreview";
import { LocalizedArrowIcon } from "../../common";
import { getWeddingDayOffset } from "../../../utils/weddingDateUtils";
import { SendMessagesAutomation, TemplateDocument } from "@wedding-plan/types";
import { enUS, he } from "date-fns/locale";

// Types for pending changes
interface PendingChange {
  scheduledTime?: Date;
  messageTemplateId?: string;
}

type PendingChanges = Record<string, PendingChange>;

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
      ...(changes.messageTemplateId && { messageTemplateId: changes.messageTemplateId }),
    });

    // Clear pending changes for this automation and exit edit mode
    const newChanges = { ...pendingChanges };
    delete newChanges[automationId];
    setPendingChanges(newChanges);
    setEditingId(null);
  };

  // Get the effective value (pending change or current value)
  const getEffectiveTime = (automation: SendMessagesAutomation): Date => {
    return pendingChanges[automation.id]?.scheduledTime || new Date(automation.scheduledTime);
  };

  const getEffectiveTemplateId = (automation: SendMessagesAutomation): string => {
    return pendingChanges[automation.id]?.messageTemplateId || automation.messageTemplateId;
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
                onTimeChange={(newTime) => handleTimeChange(automation.id, newTime)}
                onTemplateChange={(templateId) => handleTemplateChange(automation.id, templateId)}
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

// Individual automation card for dashboard
interface AutomationDashboardCardProps {
  automation: SendMessagesAutomation;
  template: TemplateDocument | undefined;
  availableTemplates: TemplateDocument[];
  effectiveTime: Date;
  offsetText: string;
  isEditing: boolean;
  hasPendingChange: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onTimeChange: (newTime: Date | null) => void;
  onTemplateChange: (templateId: string) => void;
  locale: typeof enUS | typeof he;
  t: (key: string) => string;
}

const AutomationDashboardCard: React.FC<AutomationDashboardCardProps> = ({
  automation,
  template,
  availableTemplates,
  effectiveTime,
  offsetText,
  isEditing,
  hasPendingChange,
  onStartEdit,
  onCancelEdit,
  onSaveChanges,
  onTimeChange,
  onTemplateChange,
  locale,
  t,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const isPending = automation.status === "pending";
  const isInProgress = automation.status === "inProgress";
  const isCompleted = automation.status === "completed";
  const isFailed = automation.status === "failed";
  const canEdit = isPending;

  const hasMultipleTemplates = availableTemplates.length > 1;
  const currentTemplateIndex = template
    ? availableTemplates.findIndex((t) => t.id === template.id)
    : 0;

  const handlePreviousTemplate = () => {
    if (currentTemplateIndex > 0) {
      onTemplateChange(availableTemplates[currentTemplateIndex - 1].id);
    }
  };

  const handleNextTemplate = () => {
    if (currentTemplateIndex < availableTemplates.length - 1) {
      onTemplateChange(availableTemplates[currentTemplateIndex + 1].id);
    }
  };

  // Status-specific styling
  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        headerBg: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
        headerColor: "white",
        icon: <CheckCircleIcon />,
        chipLabel: t("rsvp.automationCompleted") || "Completed",
        chipColor: "success" as const,
        borderColor: "success.main",
      };
    }
    if (isFailed) {
      return {
        headerBg: "linear-gradient(135deg, #f44336 0%, #c62828 100%)",
        headerColor: "white",
        icon: <ErrorIcon />,
        chipLabel: t("rsvp.automationFailed") || "Failed",
        chipColor: "error" as const,
        borderColor: "error.main",
      };
    }
    if (isInProgress) {
      return {
        headerBg: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
        headerColor: "white",
        icon: <HourglassIcon />,
        chipLabel: t("rsvp.automationSending") || "Sending...",
        chipColor: "warning" as const,
        borderColor: "warning.main",
      };
    }
    return {
      headerBg: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      headerColor: "text.primary",
      icon: <ScheduleIcon />,
      chipLabel: t("rsvp.automationScheduled") || "Scheduled",
      chipColor: "default" as const,
      borderColor: "divider",
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: hasPendingChange ? "primary.main" : statusConfig.borderColor,
        transition: "border-color 0.2s",
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          background: statusConfig.headerBg,
          color: statusConfig.headerColor,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {statusConfig.icon}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {automation.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Chip
                label={statusConfig.chipLabel}
                size="small"
                color={statusConfig.chipColor}
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  ...(statusConfig.headerColor === "white" && {
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }),
                }}
              />
              <Chip
                label={offsetText}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  bgcolor: statusConfig.headerColor === "white"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.08)",
                  color: statusConfig.headerColor === "white" ? "white" : "text.secondary",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Edit Button */}
        {canEdit && !isEditing && (
          <IconButton
            size="small"
            onClick={onStartEdit}
            sx={{
              color: statusConfig.headerColor,
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Card Content */}
      <Box sx={{ p: 2 }}>
        {/* Completion Stats - Show for completed/failed */}
        {(isCompleted || isFailed) && automation.completionStats && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: isCompleted ? "success.50" : "error.50",
              border: "1px solid",
              borderColor: isCompleted ? "success.200" : "error.200",
              borderRadius: 2,
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {t("rsvp.deliveryStats") || "Delivery Statistics"}
                </Typography>
                {automation.completionStats.completedAt && (
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(automation.completionStats.completedAt), "PPp", { locale })}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: "1rem" }} />}
                  label={`${automation.completionStats.successfulMessages} ${t("rsvp.successful") || "successful"}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                {automation.completionStats.failedMessages > 0 && (
                  <Chip
                    icon={<ErrorIcon sx={{ fontSize: "1rem" }} />}
                    label={`${automation.completionStats.failedMessages} ${t("rsvp.failedMessages") || "failed"}`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Scheduled Time Display / Edit */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {isCompleted
              ? t("rsvp.sentAt") || "Sent At"
              : t("rsvp.scheduledSendTime") || "Scheduled Send Time"}
          </Typography>

          {isEditing ? (
            <DateTimePicker
              value={effectiveTime}
              onChange={onTimeChange}
              minDateTime={new Date()}
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                },
              }}
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScheduleIcon color="action" fontSize="small" />
              <Typography variant="body1">
                {format(effectiveTime, "PPPp", { locale })}
              </Typography>
            </Box>
          )}
        </Box>

        {/* View Message Toggle */}
        <Button
          variant="text"
          size="small"
          onClick={() => setShowPreview(!showPreview)}
          sx={{ textTransform: "none" }}
        >
          {showPreview
            ? t("rsvp.hideMessage") || "Hide Message"
            : t("rsvp.viewMessage") || "View Message"}
        </Button>

        {/* Message Preview with Template Navigation Arrows */}
        <Collapse in={showPreview}>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            {/* Previous Arrow - only show in edit mode with multiple templates */}
            {isEditing && hasMultipleTemplates && (
              <IconButton
                onClick={handlePreviousTemplate}
                disabled={currentTemplateIndex === 0}
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
                }}
              >
                <LocalizedArrowIcon direction="previous" />
              </IconButton>
            )}

            {/* Message Preview */}
            <Box sx={{ flex: 1 }}>
              {template ? (
                <WhatsAppTemplatePreview
                  template={template}
                  scheduledTime={effectiveTime}
                  showHeader={false}
                />
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Typography color="text.secondary">
                    {t("rsvp.noTemplateAssigned") || "No template assigned"}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Next Arrow - only show in edit mode with multiple templates */}
            {isEditing && hasMultipleTemplates && (
              <IconButton
                onClick={handleNextTemplate}
                disabled={currentTemplateIndex === availableTemplates.length - 1}
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
                }}
              >
                <LocalizedArrowIcon direction="next" />
              </IconButton>
            )}
          </Box>
        </Collapse>

        {/* Edit Mode Actions: Save and Cancel */}
        {isEditing && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onCancelEdit}
              startIcon={<CloseIcon />}
              sx={{ textTransform: "none" }}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onSaveChanges}
              disabled={!hasPendingChange}
              startIcon={<SaveIcon />}
              sx={{
                textTransform: "none",
                background: hasPendingChange
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : undefined,
                "&:hover": {
                  background: hasPendingChange
                    ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
                    : undefined,
                },
              }}
            >
              {t("rsvp.saveChanges") || "Save"}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AutomationsDashboard;
