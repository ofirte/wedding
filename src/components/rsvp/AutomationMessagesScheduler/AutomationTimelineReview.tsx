import React, { useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import {
  useSendAutomations,
  useUpdateSendAutomation,
  useApproveAllAutomations,
} from "../../../hooks/rsvp";
import { useAllWeddingAvailableTemplates } from "../../../hooks/templates/useAllWeddingAvailableTemplates";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import WhatsAppTemplatePreview from "../../templates/WhatsAppTemplatePreview";
import { LocalizedArrowIcon } from "../../common";
import { getWeddingDayOffset } from "../../../utils/weddingDateUtils";
import { SendMessagesAutomation, TemplateDocument } from "@wedding-plan/types";
import { enUS, he } from "date-fns/locale";
import { useParams } from "react-router";

interface AutomationTimelineReviewProps {
  onComplete: () => void;
}

const AutomationTimelineReview: React.FC<AutomationTimelineReviewProps> = ({
  onComplete,
}) => {
  const { t, language } = useTranslation();
  const locale = language === "he" ? he : enUS;
  const { weddingId } = useParams();

  const { data: automations = [], isLoading: isLoadingAutomations } =
    useSendAutomations();
  const { data: templates = [], isLoading: isLoadingTemplates } =
    useAllWeddingAvailableTemplates();
  const { data: wedding } = useWeddingDetails();

  const { mutate: updateAutomation } = useUpdateSendAutomation();
  const { mutate: approveAllAutomations, isPending: isApproving } =
    useApproveAllAutomations();

  // Track which automations have been processed for template assignment
  const assignedTemplatesRef = useRef<Set<string>>(new Set());

  // Sort automations by scheduled time
  const sortedAutomations = useMemo(() => {
    return [...automations].sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime()
    );
  }, [automations]);

  // Auto-assign templates for automations that don't have one (runs once per automation)
  useEffect(() => {
    if (isLoadingTemplates || isLoadingAutomations || templates.length === 0)
      return;

    sortedAutomations.forEach((automation) => {
      // Skip if already processed or already has a template
      if (
        assignedTemplatesRef.current.has(automation.id) ||
        automation.messageTemplateId
      ) {
        return;
      }

      if (automation.relatedTemplateCategory) {
        // Find first template matching the category
        const matchingTemplate = templates.find(
          (t) =>
            t.category === automation.relatedTemplateCategory &&
            t.sid &&
            (t.types?.["twilio/text"]?.body || t.friendlyName)
        );

        if (matchingTemplate) {
          // Mark as processed before updating to prevent re-processing
          assignedTemplatesRef.current.add(automation.id);
          updateAutomation({
            id: automation.id,
            messageTemplateId: matchingTemplate.id,
          });
        }
      }
    });
  }, [sortedAutomations, templates, isLoadingTemplates, isLoadingAutomations]);

  // Get template by ID
  const getTemplateById = (templateId: string): TemplateDocument | undefined => {
    return templates.find((t) => t.id === templateId);
  };

  // Handle time change for an automation
  const handleTimeChange = (automationId: string, newTime: Date | null) => {
    if (!newTime) return;
    updateAutomation({
      id: automationId,
      scheduledTime: newTime,
    });
  };

  // Handle approve all
  const handleApproveAll = () => {
    if (!weddingId) return;

    approveAllAutomations(
      {
        automations: sortedAutomations,
        rsvpConfigId: weddingId,
      },
      {
        onSuccess: () => {
          onComplete();
        },
      }
    );
  };

  // Get offset text for scheduled time
  const getOffsetText = (scheduledTime: Date) => {
    if (!wedding?.date) return "";
    return getWeddingDayOffset(new Date(scheduledTime), wedding.date, t);
  };

  // Check if all automations are already approved
  const allAutomationsApproved =
    sortedAutomations.length > 0 &&
    sortedAutomations.every((automation) => automation.isActive);

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
      <Box sx={{ maxWidth: 800, mx: "auto", py: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {t("rsvp.reviewMessageTimeline") || "Review Your Message Timeline"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("rsvp.reviewTimelineDescription") ||
              "Review the scheduled messages for your guests. You can adjust the timing if needed."}
          </Typography>
        </Box>

        {/* Timeline */}
        <Stack spacing={3}>
          {sortedAutomations.map((automation) => {
            const template = getTemplateById(automation.messageTemplateId);
            const offsetText = getOffsetText(automation.scheduledTime);
            // Get all templates for this category
            const categoryTemplates = templates.filter(
              (t) =>
                t.category === automation.relatedTemplateCategory &&
                t.sid &&
                (t.types?.["twilio/text"]?.body || t.friendlyName)
            );

            return (
              <AutomationCard
                key={automation.id}
                automation={automation}
                template={template}
                availableTemplates={categoryTemplates}
                offsetText={offsetText}
                onTimeChange={(newTime) =>
                  handleTimeChange(automation.id, newTime)
                }
                onTemplateChange={(templateId) => {
                  updateAutomation({
                    id: automation.id,
                    messageTemplateId: templateId,
                  });
                }}
                locale={locale}
                t={t}
              />
            );
          })}
        </Stack>

        {/* Approve Button - only show if not all approved */}
        {!allAutomationsApproved && (
          <Box sx={{ textAlign: "center", mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleApproveAll}
              disabled={isApproving || sortedAutomations.length === 0}
              startIcon={
                isApproving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircleIcon />
                )
              }
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                },
                "&:disabled": {
                  background: "grey.300",
                },
              }}
            >
              {isApproving
                ? t("common.loading") || "Loading..."
                : t("rsvp.approve") || "Approve"}
            </Button>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

// Individual automation card component (simple - all editable)
interface AutomationCardProps {
  automation: SendMessagesAutomation;
  template: TemplateDocument | undefined;
  availableTemplates: TemplateDocument[];
  offsetText: string;
  onTimeChange: (newTime: Date | null) => void;
  onTemplateChange: (templateId: string) => void;
  locale: typeof enUS | typeof he;
  t: (key: string) => string;
}

const AutomationCard: React.FC<AutomationCardProps> = ({
  automation,
  template,
  availableTemplates,
  offsetText,
  onTimeChange,
  onTemplateChange,
  t,
}) => {
  const scheduledTime = new Date(automation.scheduledTime);
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

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
          color: "text.primary",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ScheduleIcon color="action" />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {automation.name}
            </Typography>
            <Chip
              label={offsetText}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: "rgba(0,0,0,0.08)",
                color: "text.secondary",
                fontWeight: "medium",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Card Content */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Message Preview with Template Navigation */}
          <Box>
            {hasMultipleTemplates && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t("rsvp.changeTemplate") || "Change Template"} (
                  {currentTemplateIndex + 1}/{availableTemplates.length})
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {hasMultipleTemplates && (
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
              <Box sx={{ flex: 1 }}>
                {template ? (
                  <WhatsAppTemplatePreview
                    template={template}
                    scheduledTime={scheduledTime}
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
              {hasMultipleTemplates && (
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
          </Box>

          {/* Time Picker */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="medium"
              sx={{ mb: 1.5 }}
            >
              {t("rsvp.scheduledSendTime") || "Scheduled Send Time"}
            </Typography>
            <DateTimePicker
              value={scheduledTime}
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
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default AutomationTimelineReview;
