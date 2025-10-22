import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Schedule } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useRSVPConfig, useSendAutomations } from "../../../hooks/rsvp";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import { useCreateSendAutomation } from "../../../hooks/rsvp";
import {
  AutomationType,
  TargetAudienceFilter,
  TemplatesCategories,
} from "@wedding-plan/types";
import { ScheduleOverview } from "./components/ScheduleOverview";
import { ApprovalButton } from "./components/ApprovalButton";
import { se } from "date-fns/locale";

interface AutomationSchedulerProps {
  onSchedulingComplete?: (automations: any[]) => void;
}

export interface ScheduleItem {
  messageType: string;
  templateId: string;
  scheduledDate: Date;
  title: string;
  description: string;
  automationType: AutomationType;
}

const AutomationScheduler: React.FC<AutomationSchedulerProps> = ({
  onSchedulingComplete,
}) => {
  const { t } = useTranslation();
  const [editableScheduleItems, setEditableScheduleItems] = useState<
    ScheduleItem[]
  >([]);
  const [isCreatingAutomations, setIsCreatingAutomations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApprovalComplete, setIsApprovalComplete] = useState(false);

  // Hooks
  const { data: rsvpConfig, isLoading: isLoadingConfig } = useRSVPConfig();
  const { data: wedding, isLoading: isLoadingWedding } = useWeddingDetails();
  const { mutateAsync: createAutomation } = useCreateSendAutomation();
  const { data: sendMessagesAutomations, isLoading: isLoadingAutomations } =
    useSendAutomations();

  // Calculate schedule items - use existing automations if available, otherwise use default calculation
  const scheduleItems = useMemo(() => {
    if (!wedding?.date || !rsvpConfig?.selectedTemplates) {
      return [];
    }

    // If we have existing automations, convert them to schedule items
    if (sendMessagesAutomations && sendMessagesAutomations.length > 0) {
      return sendMessagesAutomations
        .map((automation) => ({
          messageType: automation.automationType, // Use automation type as message type
          templateId: automation.messageTemplateId,
          scheduledDate: new Date(automation.scheduledTime),
          title: automation.name,
          description: `${automation.automationType} automation`,
          automationType: automation.automationType,
        }))
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    }

    // Otherwise, calculate default schedule
    const weddingDate = new Date(wedding.date);
    const schedules: ScheduleItem[] = [];

    // Helper function to calculate date
    const calculateDate = (daysFromWedding: number, hour = 10) => {
      const date = new Date(weddingDate);
      date.setDate(date.getDate() + daysFromWedding);
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    // Define message schedule based on templates selected
    const messageConfig: Array<{
      category: TemplatesCategories;
      daysFromWedding: number;
      titleKey: string;
      descriptionKey: string;
      automationType: AutomationType;
    }> = [
      {
        category: "initialRsvp",
        daysFromWedding: -21, // 3 weeks before
        titleKey: t("userRsvp.messagesPlan.initialRsvp.title"),
        descriptionKey: t("userRsvp.messagesPlan.initialRsvp.description"),
        automationType: "rsvp" as AutomationType,
      },
      {
        category: "secondRsvp",
        daysFromWedding: -16, // 5 days after initial
        titleKey: t("userRsvp.messagesPlan.secondRsvp.title"),
        descriptionKey: t("userRsvp.messagesPlan.secondRsvp.description"),
        automationType: "rsvp" as AutomationType,
      },
      {
        category: "finalRsvp",
        daysFromWedding: -13, // 3 days after second
        titleKey: t("userRsvp.messagesPlan.finalRsvp.title"),
        descriptionKey: t("userRsvp.messagesPlan.finalRsvp.description"),
        automationType: "rsvp" as AutomationType,
      },
      {
        category: "dayBefore",
        daysFromWedding: -1, // 1 day before
        titleKey: t("userRsvp.messagesPlan.dayBefore.title"),
        descriptionKey: t("userRsvp.messagesPlan.dayBefore.description"),
        automationType: "reminder" as AutomationType,
      },
      {
        category: "dayAfterThankyou",
        daysFromWedding: 1, // 1 day after
        titleKey: t("userRsvp.messagesPlan.dayAfterThankyou.title"),
        descriptionKey: t("userRsvp.messagesPlan.dayAfterThankyou.description"),
        automationType: "reminder" as AutomationType,
      },
    ];

    messageConfig.forEach((config) => {
      const selectedTemplate = rsvpConfig.selectedTemplates?.[config.category];
      if (selectedTemplate) {
        schedules.push({
          messageType: config.category,
          templateId: selectedTemplate.templateFireBaseId,
          scheduledDate: calculateDate(config.daysFromWedding),
          title: t(config.titleKey),
          description: t(config.descriptionKey),
          automationType: config.automationType,
        });
      }
    });

    return schedules.sort(
      (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );
  }, [
    wedding?.date,
    rsvpConfig?.selectedTemplates,
    sendMessagesAutomations,
    t,
  ]);

  // Initialize editable schedule items when schedule items are calculated
  useEffect(() => {
    if (scheduleItems.length > 0 && editableScheduleItems.length === 0) {
      setEditableScheduleItems(scheduleItems);
      if ((sendMessagesAutomations?.length || 0) >= 0) {
        onSchedulingComplete?.(scheduleItems);
      }
    }
  }, [scheduleItems, editableScheduleItems.length, sendMessagesAutomations]);

  const handleDateChange = (index: number, newDate: Date) => {
    const updatedItems = [...editableScheduleItems];
    updatedItems[index].scheduledDate = newDate;
    setEditableScheduleItems(updatedItems);
  };

  const handleApproveSchedule = async () => {
    if (!editableScheduleItems.length) {
      setError(t("scheduler.noScheduleItems"));
      return;
    }

    setIsCreatingAutomations(true);
    setError(null);

    try {
      const automationPromises = editableScheduleItems.map((item) => {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const scheduledTimeUTC = new Date(item.scheduledDate.toISOString());

        const automationData = {
          name: `${item.title} - ${item.scheduledDate.toLocaleDateString()}`,
          isActive: true,
          status: "pending" as const,
          sentMessagesIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          messageTemplateId: item.templateId,
          scheduledTime: scheduledTimeUTC,
          scheduledTimeZone: userTimeZone,
          automationType: item.automationType,
          targetAudienceFilter: {} as TargetAudienceFilter,
        };

        return createAutomation(automationData);
      });

      await Promise.all(automationPromises);
      setIsApprovalComplete(true);
      onSchedulingComplete?.(editableScheduleItems);
    } catch (err) {
      console.error("Error creating automations:", err);
      setError(t("scheduler.createAutomationsError"));
    } finally {
      setIsCreatingAutomations(false);
    }
  };

  if (isLoadingConfig || isLoadingWedding || isLoadingAutomations) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!wedding?.date) {
    return (
      <Alert severity="warning">{t("scheduler.weddingDateRequired")}</Alert>
    );
  }

  if (
    !rsvpConfig?.selectedTemplates ||
    Object.keys(rsvpConfig.selectedTemplates).length === 0
  ) {
    return <Alert severity="info">{t("scheduler.templatesRequired")}</Alert>;
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Schedule color="primary" />
            <Typography variant="h5">
              {t("userRsvp.scheduler.title")}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("userRsvp.scheduler.description")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {isApprovalComplete ? (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
              {t("userRsvp.scheduler.automationsCreated")}
            </Alert>
          ) : (
            <>
              <ScheduleOverview
                weddingDate={wedding.date}
                scheduleItems={editableScheduleItems}
                onDateChange={handleDateChange}
                disabled={isCreatingAutomations}
                automations={sendMessagesAutomations || []}
              />

              {/* Only show approval button if no existing automations */}
              {(!sendMessagesAutomations ||
                sendMessagesAutomations.length === 0) && (
                <ApprovalButton
                  onApprove={handleApproveSchedule}
                  isLoading={isCreatingAutomations}
                  disabled={editableScheduleItems.length === 0}
                />
              )}

              {/* Show status for existing automations */}
              {sendMessagesAutomations &&
                sendMessagesAutomations.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t("scheduler.existingAutomations", {
                      count: sendMessagesAutomations.length,
                    })}
                  </Alert>
                )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AutomationScheduler;
