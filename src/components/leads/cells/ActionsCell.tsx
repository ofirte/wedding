import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete as DeleteIcon, Event as EventIcon } from "@mui/icons-material";
import { Lead } from "@wedding-plan/types";

interface ActionsCellProps {
  lead: Lead;
  isHovered: boolean;
  onViewActivity: (lead: Lead) => void;
  onDelete: (leadId: string, e: React.MouseEvent) => void;
  activityTooltip: string;
  deleteTooltip: string;
}

export const ActionsCell: React.FC<ActionsCellProps> = ({
  lead,
  isHovered,
  onViewActivity,
  onDelete,
  activityTooltip,
  deleteTooltip,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        opacity: isHovered ? 1 : 0.3,
        transition: "opacity 0.15s ease",
      }}
    >
      <Tooltip title={activityTooltip}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onViewActivity(lead);
          }}
          sx={{
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
            },
          }}
        >
          <EventIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteTooltip}>
        <IconButton
          size="small"
          onClick={(e) => onDelete(lead.id, e)}
          sx={{
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
