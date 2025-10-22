import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  TextField,
  Chip,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useCreateSendAutomation } from "../../../hooks/rsvp";

interface AutomationSchedulerProps {
  selectedTemplates: string[];
  onSchedulingComplete: (automations: string[]) => void;
  scheduledAutomations: string[];
}

interface ScheduleItem {
  templateId: string;
  name: string;
  type: "rsvp" | "reminder";
  scheduledTime: Date | null;
  description: string;
}

/**
 * AutomationScheduler - User-friendly automation scheduling interface
 *
 * Allows users to schedule their selected templates with specific dates and times.
 */
const AutomationScheduler: React.FC<AutomationSchedulerProps> = ({
  selectedTemplates,
  onSchedulingComplete,
  scheduledAutomations,
}) => {
  const { t } = useTranslation();
  const createAutomation = useCreateSendAutomation();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize schedule items based on selected templates
  useEffect(() => {
    if (selectedTemplates.length > 0 && scheduleItems.length === 0) {
      const items: ScheduleItem[] = selectedTemplates.map(
        (templateId, index) => {
          // Determine automation type and default timing based on template order
          let name = "";
          let type: "rsvp" | "reminder" = "rsvp";
          let description = "";
          let defaultTime = new Date();

          if (index < 3) {
            // First 3 are RSVP messages
            name = `${t("userRsvp.scheduler.rsvpMessage")} ${index + 1}`;
            type = "rsvp";
            description = t("userRsvp.scheduler.rsvpMessageDesc");
            // Space them out by a few days
            defaultTime.setDate(defaultTime.getDate() + index * 3);
          } else if (index === 3) {
            // 4th is day before reminder
            name = t("userRsvp.scheduler.dayBeforeReminder");
            type = "reminder";
            description = t("userRsvp.scheduler.dayBeforeDesc");
            // Set to 1 day before a default wedding date (30 days from now)
            defaultTime.setDate(defaultTime.getDate() + 29);
          } else {
            // 5th is thank you message
            name = t("userRsvp.scheduler.thankYouMessage");
            type = "reminder";
            description = t("userRsvp.scheduler.thankYouDesc");
            // Set to 1 day after wedding
            defaultTime.setDate(defaultTime.getDate() + 31);
          }

          return {
            templateId,
            name,
            type,
            scheduledTime: defaultTime,
            description,
          };
        }
      );

      setScheduleItems(items);
    }
  }, [selectedTemplates, t]);

  const handleTimeChange = (index: number, newTime: Date | null) => {
    setScheduleItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, scheduledTime: newTime } : item
      )
    );
  };

  const handleNameChange = (index: number, newName: string) => {
    setScheduleItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  };

  const isAllScheduled = () => {
    return scheduleItems.every(
      (item) => item.scheduledTime !== null && item.name.trim() !== ""
    );
  };

  const handleCreateAutomations = async () => {
    if (!isAllScheduled()) return;

    setIsCreating(true);
    const createdAutomations: string[] = [];

    try {
      for (const item of scheduleItems) {
        const automationData = {
          name: item.name,
          isActive: true,
          status: "pending" as const,
          sentMessagesIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          messageTemplateId: item.templateId,
          scheduledTime: item.scheduledTime!,
          scheduledTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          automationType: item.type,
          targetAudienceFilter: {},
        };

        const result = await createAutomation.mutateAsync(automationData);
        createdAutomations.push(result.id);
      }

      onSchedulingComplete(createdAutomations);
    } catch (error) {
      console.error("Error creating automations:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (selectedTemplates.length === 0) {
    return (
      <Alert severity="warning">
        {t("userRsvp.scheduler.noTemplatesSelected")}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
          textAlign="center"
          sx={{ fontWeight: 600 }}
        >
          {t("userRsvp.scheduler.title")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          paragraph
        >
          {t("userRsvp.scheduler.description")}
        </Typography>

        {/* Progress Indicator */}
        <Box textAlign="center" mb={4}>
          <Chip
            label={`${
              scheduleItems.filter((item) => item.scheduledTime).length
            } / ${scheduleItems.length} ${t("userRsvp.scheduler.scheduled")}`}
            color={isAllScheduled() ? "success" : "default"}
            icon={isAllScheduled() ? <CheckCircleIcon /> : <ScheduleIcon />}
            sx={{ px: 2, py: 0.5 }}
          />
        </Box>

        {/* Schedule Items */}
        <Box display="flex" flexDirection="column" gap={3}>
          {scheduleItems.map((item, index) => (
            <Card
              key={index}
              sx={{
                border: item.scheduledTime
                  ? "2px solid #4CAF50"
                  : "1px solid #e0e0e0",
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={
                      item.type === "rsvp"
                        ? t("userRsvp.scheduler.rsvpType")
                        : t("userRsvp.scheduler.reminderType")
                    }
                    color={item.type === "rsvp" ? "primary" : "secondary"}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {t("userRsvp.scheduler.messageNumber")} {index + 1}
                  </Typography>
                  {item.scheduledTime && (
                    <CheckCircleIcon sx={{ color: "success.main" }} />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>

                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <TextField
                    label={t("userRsvp.scheduler.automationName")}
                    value={item.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    sx={{ minWidth: 250, flex: 1 }}
                    size="small"
                  />

                  <DateTimePicker
                    label={t("userRsvp.scheduler.scheduledTime")}
                    value={item.scheduledTime}
                    onChange={(newTime) => handleTimeChange(index, newTime)}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { minWidth: 200 },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Create Automations Button */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateAutomations}
            disabled={!isAllScheduled() || isCreating}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            {isCreating
              ? t("userRsvp.scheduler.creating")
              : t("userRsvp.scheduler.createAutomations")}
          </Button>
        </Box>

        {/* Status Messages */}
        {isAllScheduled() && !scheduledAutomations.length && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              ✅ {t("userRsvp.scheduler.readyToCreate")}
            </Typography>
          </Alert>
        )}

        {scheduledAutomations.length > 0 && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              🎉{" "}
              {t("userRsvp.scheduler.automationsCreated", {
                count: scheduledAutomations.length,
              })}
            </Typography>
          </Alert>
        )}

        {!isAllScheduled() && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              📅 {t("userRsvp.scheduler.completeAllSchedules")}
            </Typography>
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AutomationScheduler;
