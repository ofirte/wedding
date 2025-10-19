import React from "react";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DSTable, { Column } from "../common/DSTable";
import { useTranslation } from "../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { format } from "date-fns";

interface SendAutomationsTableProps {
  automations: SendMessagesAutomation[];
  onEdit?: (automation: SendMessagesAutomation) => void;
  onDelete?: (automation: SendMessagesAutomation) => void;
  isLoading?: boolean;
}

/**
 * SendAutomationsTable - Data table for displaying send automations
 *
 * Tells the story: "Here are your automated message campaigns"
 */
const SendAutomationsTable: React.FC<SendAutomationsTableProps> = ({
  automations,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { t } = useTranslation();

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

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case "rsvp":
        return t("rsvp.rsvpAutomation");
      case "reminder":
        return t("rsvp.reminderAutomation");
      default:
        return type;
    }
  };

  const columns: Column<SendMessagesAutomation>[] = [
    {
      id: "name",
      label: t("rsvp.automationName"),
      render: (automation) => automation.name,
      sortable: true,
    },
    {
      id: "automationType",
      label: t("rsvp.automationType"),
      render: (automation) => (
        <Chip 
          label={getAutomationTypeLabel(automation.automationType)} 
          size="small"
          variant="outlined"
        />
      ),
      sortable: true,
    },
    {
      id: "status",
      label: t("rsvp.status"),
      render: (automation) => (
        <Chip 
          label={automation.status} 
          color={getStatusColor(automation.status)}
          size="small"
        />
      ),
      sortable: true,
    },
    {
      id: "scheduledTime",
      label: t("rsvp.scheduledTime"),
      render: (automation) => format(new Date(automation.scheduledTime), "PPp"),
      sortable: true,
    },
    {
      id: "createdAt",
      label: t("rsvp.dateCreated"),
      render: (automation) => format(new Date(automation.createdAt), "PP"),
      sortable: true,
    },
    {
      id: "actions",
      label: t("common.actions"),
      render: (automation) => (
        <Box display="flex" gap={1}>
          {onEdit && (
            <Tooltip title={t("common.edit")}>
              <IconButton
                size="small"
                onClick={() => onEdit(automation)}
                disabled={automation.status === "inProgress"}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title={t("common.delete")}>
              <IconButton
                size="small"
                onClick={() => onDelete(automation)}
                disabled={automation.status === "inProgress"}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      sortable: false,
    },
  ];

  return (
    <DSTable
      data={automations}
      columns={columns}
      showExport={false}
      showSelectColumn={false}
    />
  );
};

export default SendAutomationsTable;