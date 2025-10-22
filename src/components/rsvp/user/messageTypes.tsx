import React from "react";
import {
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

export interface MessageType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info";
}

export const getMessageTypes = (t: (key: string) => string): MessageType[] => [
  {
    id: "initialRsvp",
    title: t("userRsvp.messagesPlan.initialRsvp.title"),
    description: t("userRsvp.messagesPlan.initialRsvp.description"),
    icon: <MessageIcon />,
    color: "primary",
  },
  {
    id: "secondRsvp",
    title: t("userRsvp.messagesPlan.secondRsvp.title"),
    description: t("userRsvp.messagesPlan.secondRsvp.description"),
    icon: <MessageIcon />,
    color: "secondary",
  },
  {
    id: "finalRsvp",
    title: t("userRsvp.messagesPlan.finalRsvp.title"),
    description: t("userRsvp.messagesPlan.finalRsvp.description"),
    icon: <MessageIcon />,
    color: "warning",
  },
  {
    id: "dayBefore",
    title: t("userRsvp.messagesPlan.dayBefore.title"),
    description: t("userRsvp.messagesPlan.dayBefore.description"),
    icon: <ScheduleIcon />,
    color: "info",
  },
  {
    id: "dayAfterThankyou",
    title: t("userRsvp.messagesPlan.dayAfterThankyou.title"),
    description: t("userRsvp.messagesPlan.dayAfterThankyou.description"),
    icon: <CheckCircleIcon />,
    color: "success",
  },
];
