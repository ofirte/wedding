import React from "react";
import { Box, Typography, Chip, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { StatusConfig } from "../types";

interface AutomationCardHeaderProps {
  automation: SendMessagesAutomation;
  statusConfig: StatusConfig;
  offsetText: string;
  canEdit: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
}

export const AutomationCardHeader: React.FC<AutomationCardHeaderProps> = ({
  automation,
  statusConfig,
  offsetText,
  canEdit,
  isEditing,
  onStartEdit,
}) => {
  return (
    <Box
      sx={{
        background: statusConfig.headerBg,
        color: statusConfig.headerColor,
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {statusConfig.icon}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {automation.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Chip
              label={statusConfig.chipLabel}
              size="small"
              color={statusConfig.chipColor}
              sx={{
                height: 20,
                fontSize: "0.7rem",
                ...(statusConfig.headerColor === "white" && {
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                }),
              }}
            />
            <Chip
              label={offsetText}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor:
                  statusConfig.headerColor === "white"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.08)",
                color:
                  statusConfig.headerColor === "white"
                    ? "white"
                    : "text.secondary",
              }}
            />
          </Box>
        </Box>
      </Box>

      {canEdit && !isEditing && (
        <IconButton
          size="small"
          onClick={onStartEdit}
          sx={{
            color: statusConfig.headerColor,
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};
