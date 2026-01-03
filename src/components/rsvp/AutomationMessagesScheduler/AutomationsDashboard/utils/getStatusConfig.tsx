import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { StatusConfig } from "../types";

export const getStatusConfig = (
  automation: SendMessagesAutomation,
  t: (key: string) => string
): StatusConfig => {
  const { status } = automation;

  if (status === "completed") {
    return {
      headerBg: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
      headerColor: "white",
      icon: <CheckCircleIcon />,
      chipLabel: t("rsvp.automationCompleted") || "Completed",
      chipColor: "success",
      borderColor: "success.main",
    };
  }

  if (status === "failed") {
    return {
      headerBg: "linear-gradient(135deg, #f44336 0%, #c62828 100%)",
      headerColor: "white",
      icon: <ErrorIcon />,
      chipLabel: t("rsvp.automationFailed") || "Failed",
      chipColor: "error",
      borderColor: "error.main",
    };
  }

  if (status === "inProgress") {
    return {
      headerBg: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
      headerColor: "white",
      icon: <HourglassIcon />,
      chipLabel: t("rsvp.automationSending") || "Sending...",
      chipColor: "warning",
      borderColor: "warning.main",
    };
  }

  // Default: pending
  return {
    headerBg: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
    headerColor: "text.primary",
    icon: <ScheduleIcon />,
    chipLabel: t("rsvp.automationScheduled") || "Scheduled",
    chipColor: "default",
    borderColor: "divider",
  };
};
