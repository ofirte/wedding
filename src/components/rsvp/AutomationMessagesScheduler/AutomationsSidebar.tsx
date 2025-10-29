import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useSendAutomations } from "../../../hooks/rsvp";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";
import { getWeddingDayOffset } from "../../../utils/weddingDateUtils";

interface AutomationsSidebarProps {
  onSelectAutomation?: (automation: SendMessagesAutomation) => void;
  selectedAutomationId?: string;
}

const AutomationsSidebar: React.FC<AutomationsSidebarProps> = ({
  onSelectAutomation,
  selectedAutomationId,
}) => {
  const { t, language } = useTranslation();
  const { data: automations = [], isLoading, error } = useSendAutomations();
  const { data: wedding } = useWeddingDetails();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "inProgress":
        return "info";
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const formatScheduledTime = (scheduledTime: Date) => {
    const date = new Date(scheduledTime);
    const locale = language === "he" ? he : enUS;
    return format(date, "MMM d, HH:mm", { locale });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("common.errorLoading")}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: "calc(100% - 64px)", overflow: "auto" }}>
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ mb: 3, fontWeight: 600 }}
      >
        {t("rsvp.sendAutomations")} ({automations.length})
      </Typography>

      {automations.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("rsvp.noAutomationsDescription")}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {automations
            .sort(
              (a, b) =>
                new Date(a.scheduledTime).getTime() -
                new Date(b.scheduledTime).getTime()
            )
            .map((automation) => (
              <Card
                key={automation.id}
                elevation={automation.id === selectedAutomationId ? 2 : 0}
                sx={{
                  border: "2px solid",
                  borderColor:
                    automation.id === selectedAutomationId
                      ? "primary.main"
                      : "divider",
                  borderRadius: 2,
                  cursor: onSelectAutomation ? "pointer" : "default",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor:
                    automation.id === selectedAutomationId
                      ? "primary.50"
                      : "background.paper",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                }}
                onClick={() => onSelectAutomation?.(automation)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            color: automation.isActive
                              ? "text.primary"
                              : "text.secondary",
                          }}
                        >
                          {automation.name}
                        </Typography>
                        {wedding?.date && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {formatScheduledTime(automation.scheduledTime)} •{" "}
                            {getWeddingDayOffset(
                              automation.scheduledTime,
                              wedding.date,
                              t
                            )}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        {!automation.isActive ? (
                          <Chip
                            label={t("common.inactive")}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label={
                              t(`rsvp.${automation.status}` as any) ||
                              automation.status
                            }
                            size="small"
                            color={getStatusColor(automation.status) as any}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}
    </Box>
  );
};

export default AutomationsSidebar;
