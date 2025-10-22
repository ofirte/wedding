import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import {
  Event,
  Schedule,
  CheckCircle,
  Error,
  Pending,
  PlayArrow,
} from "@mui/icons-material";
import { format, differenceInDays } from "date-fns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "../../../../localization/LocalizationContext";
import { ScheduleItem } from "../AutomationScheduler";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { UserOverviewAutomationResults } from "./UserOverviewAutomationResults";

interface ScheduleOverviewProps {
  weddingDate: Date;
  scheduleItems: ScheduleItem[];
  onDateChange?: (index: number, newDate: Date) => void;
  disabled?: boolean;
  automations?: SendMessagesAutomation[];
}

export const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({
  weddingDate,
  scheduleItems,
  onDateChange,
  disabled = false,
  automations = [],
}) => {
  const { t } = useTranslation();
  const [selectedAutomation, setSelectedAutomation] =
    useState<SendMessagesAutomation | null>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  const formatRelativeDate = (date: Date, weddingDate: Date): string => {
    // Normalize both dates to midnight for accurate day-only comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const normalizedWeddingDate = new Date(weddingDate);
    normalizedWeddingDate.setHours(0, 0, 0, 0);

    const days = differenceInDays(normalizedDate, normalizedWeddingDate);

    if (days === 0) {
      return t("userRsvp.scheduler.onWeddingDay");
    } else if (days === 1) {
      return t("userRsvp.scheduler.oneDayAfter");
    } else if (days === -1) {
      return t("userRsvp.scheduler.oneDayBefore");
    } else if (days > 0) {
      return t("userRsvp.scheduler.daysAfter", { days });
    } else {
      return t("userRsvp.scheduler.daysBefore", { days: Math.abs(days) });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "inProgress":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle fontSize="small" />;
      case "inProgress":
        return <PlayArrow fontSize="small" />;
      case "failed":
        return <Error fontSize="small" />;
      default:
        return <Pending fontSize="small" />;
    }
  };

  const findAutomationForItem = (
    item: ScheduleItem
  ): SendMessagesAutomation | undefined => {
    return automations.find(
      (automation) =>
        automation.messageTemplateId === item.templateId ||
        automation.name.includes(item.title)
    );
  };

  const handleAutomationClick = (automation: SendMessagesAutomation) => {
    if (automation.status === "completed") {
      setSelectedAutomation(automation);
      setIsResultsDialogOpen(true);
    }
  };

  const handleCloseResults = () => {
    setIsResultsDialogOpen(false);
    setSelectedAutomation(null);
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Event color="primary" />
          <Typography variant="h6">
            {t("userRsvp.scheduler.scheduleOverview")}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Typography variant="body2" color="text.secondary">
            {t("userRsvp.scheduler.weddingDate")}:
          </Typography>
          <Chip
            label={format(new Date(weddingDate), "PPP")}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("userRsvp.scheduler.messageTimeline")}:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {scheduleItems.map((item, index) => {
              const automation = findAutomationForItem(item);
              const isClickable = automation?.status === "completed";

              return (
                <Box
                  key={`${item.messageType}-${index}`}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  py={2}
                  sx={{
                    borderBottom:
                      index < scheduleItems.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    cursor: isClickable ? "pointer" : "default",
                    "&:hover": isClickable
                      ? {
                          backgroundColor: "action.hover",
                        }
                      : {},
                    borderRadius: 1,
                    px: 1,
                  }}
                  onClick={() =>
                    automation &&
                    isClickable &&
                    handleAutomationClick(automation)
                  }
                >
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">{item.title}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      (
                      {formatRelativeDate(
                        item.scheduledDate,
                        new Date(weddingDate)
                      )}
                      )
                    </Typography>

                    {/* Show automation status if automation exists */}
                    {automation && (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ ml: 2 }}
                      >
                        <Chip
                          label={t(`rsvp.${automation.status}`)}
                          color={getStatusColor(automation.status)}
                          size="small"
                          icon={getStatusIcon(automation.status)}
                          clickable={isClickable}
                        />
                        {automation.status === "completed" &&
                          automation.completionStats && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({automation.completionStats.successfulMessages}{" "}
                              sent)
                            </Typography>
                          )}
                      </Box>
                    )}
                  </Box>

                  {/* Only show DateTimePicker if no automation exists (default schedule) */}
                  {!automation && (
                    <Box sx={{ minWidth: 220 }}>
                      <DateTimePicker
                        value={item.scheduledDate}
                        onChange={(newValue) => {
                          if (newValue && onDateChange) {
                            onDateChange(index, newValue);
                          }
                        }}
                        disabled={disabled}
                        slotProps={{
                          textField: {
                            size: "small",
                            variant: "outlined",
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Show scheduled time for existing automations */}
                  {automation && (
                    <Box sx={{ minWidth: 220, textAlign: "right" }}>
                      <Typography variant="body2">
                        {format(new Date(automation.scheduledTime), "MMM d, p")}
                      </Typography>
                      {isClickable && (
                        <Typography variant="caption" color="primary">
                          {t("common.clickForDetails")}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </LocalizationProvider>
        </Box>
      </CardContent>

      {/* Automation Results Dialog */}
      <UserOverviewAutomationResults
        open={isResultsDialogOpen}
        onClose={handleCloseResults}
        automation={selectedAutomation}
      />
    </Card>
  );
};
