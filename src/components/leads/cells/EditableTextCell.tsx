import React from "react";
import { Box, TextField, Typography, Tooltip } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { Lead } from "@wedding-plan/types";

interface EditableTextCellProps {
  lead: Lead;
  field: keyof Lead;
  isEditing: boolean;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  showWarning?: boolean;
  warningTooltip?: string;
  onCellClick: (lead: Lead, field: keyof Lead) => void;
  onEditValueChange: (value: string) => void;
  onBlur: (lead: Lead, field: string) => void;
  onKeyDown: (e: React.KeyboardEvent, lead: Lead, field: string) => void;
}

export const EditableTextCell: React.FC<EditableTextCellProps> = ({
  lead,
  field,
  isEditing,
  editValue,
  inputRef,
  showWarning = false,
  warningTooltip,
  onCellClick,
  onEditValueChange,
  onBlur,
  onKeyDown,
}) => {
  if (isEditing) {
    return (
      <TextField
        ref={inputRef}
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onBlur={() => onBlur(lead, field)}
        onKeyDown={(e) => onKeyDown(e, lead, field)}
        size="small"
        variant="standard"
        type={
          field === "budget" || field === "estimatedGuests"
            ? "number"
            : field === "weddingDate" || field === "followUpDate"
            ? "date"
            : "text"
        }
        fullWidth
        InputProps={{
          disableUnderline: true,
          sx: {
            fontSize: "0.875rem",
            backgroundColor: "rgba(66, 133, 244, 0.08)",
            borderRadius: "6px",
            px: 1.5,
            py: 0.5,
          },
        }}
      />
    );
  }

  const value = lead[field];
  let displayValue = value;

  if (field === "weddingDate" || field === "followUpDate") {
    displayValue = value ? new Date(value as string).toLocaleDateString() : "";
  } else if (field === "budget") {
    displayValue = value ? `₪${(value as number).toLocaleString()}` : "";
  }

  return (
    <Box
      onClick={() => onCellClick(lead, field)}
      sx={{
        cursor: "text",
        borderRadius: "6px",
        transition: "background-color 0.15s ease",
        px: 0.5,
        py: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        width: "100%",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
      }}
    >
      {showWarning && warningTooltip && (
        <Tooltip title={warningTooltip}>
          <WarningIcon color="error" fontSize="small" />
        </Tooltip>
      )}
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontSize: "0.875rem",
          color: displayValue ? "text.primary" : "text.disabled",
          fontWeight: field === "name" ? 600 : 400,
        }}
      >
        {displayValue || "-"}
      </Typography>
    </Box>
  );
};
