import React from "react";
import { Column } from "../common/DSTable";
import { Chip, Box, Typography } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { SentMessage } from "../../api/rsvp/rsvpApi";
import { format } from "date-fns";
import { Invitee } from "@wedding-plan/types";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
    case "read":
      return <CheckCircleIcon color="success" fontSize="small" />;
    case "sent":
      return <SendIcon color="primary" fontSize="small" />;
    case "failed":
    case "undelivered":
      return <ErrorIcon color="error" fontSize="small" />;
    case "queued":
    case "accepted":
      return <ScheduleIcon color="warning" fontSize="small" />;
    default:
      return <ScheduleIcon color="disabled" fontSize="small" />;
  }
};

const getStatusColor = (
  status: string
): "success" | "error" | "warning" | "info" | "default" => {
  switch (status) {
    case "delivered":
    case "read":
      return "success";
    case "sent":
      return "info";
    case "failed":
    case "undelivered":
      return "error";
    case "queued":
    case "accepted":
      return "warning";
    default:
      return "default";
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return dateString;
  }
};

export const createSentMessagesColumns = (
  t: (key: string) => string,
  guests: Invitee[]
): Column<SentMessage>[] => [
  {
    id: "to",
    label: t("contacts.inviteeName"),
    sortable: true,
    render: (message: SentMessage) => {
      const guest = guests.find((g) => g.id === message.userId);
      return (
        <Typography variant="body2">
          {guest ? guest.name : message.to}
        </Typography>
      );
    },
  },
  {
    id: "dateCreated",
    label: t("rsvp.dateSent"),
    sortable: true,
    render: (message: SentMessage) => (
      <Typography variant="body2">{formatDate(message.dateCreated)}</Typography>
    ),
    sortFn: (a: SentMessage, b: SentMessage) => {
      return (
        new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );
    },
  },
  {
    id: "status",
    label: t("rsvp.status"),
    sortable: true,
    render: (message: SentMessage) => (
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        {getStatusIcon(message.status)}
        <Chip
          label={message.status}
          color={getStatusColor(message.status)}
          size="small"
          sx={{
            width: ({ spacing }) => spacing(12),
          }}
        />
      </Box>
    ),
    filterConfig: {
      id: "status",
      label: t("rsvp.status"),
      type: "multiple",
      options: (data: SentMessage[]) => {
        const uniqueStatuses = Array.from(
          new Set(data.map((item) => item.status))
        ).filter(Boolean);
        return uniqueStatuses.map((status) => ({
          value: status,
          label: status,
        }));
      },
    },
  },
];
