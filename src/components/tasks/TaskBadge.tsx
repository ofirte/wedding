import React from "react";
import { Box } from "@mui/material";

interface TaskBadgeProps {
  label: string;
  color: string;
  opacity?: number;
}

/**
 * A styled badge component for displaying task metadata
 */
export const TaskBadge: React.FC<TaskBadgeProps> = ({
  label,
  color,
  opacity = 0.1,
}) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      px: 1,
      py: 0.25,
      borderRadius: 1,
      fontSize: "11px",
      fontWeight: 500,
      bgcolor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
      color: color,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </Box>
);
