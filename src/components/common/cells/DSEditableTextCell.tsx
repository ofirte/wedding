import React from "react";
import { Box, TextField, Typography, Tooltip } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

export type DSEditableTextCellType = "text" | "number" | "date";

interface DSEditableTextCellProps {
  value: string | number | null | undefined;
  isEditing: boolean;
  editValue: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  type?: DSEditableTextCellType;
  placeholder?: string;
  showWarning?: boolean;
  warningTooltip?: string;
  fontWeight?: number;
  formatDisplay?: (value: string | number | null | undefined) => string;
  onStartEdit: () => void;
  onEditValueChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const DSEditableTextCell: React.FC<DSEditableTextCellProps> = ({
  value,
  isEditing,
  editValue,
  inputRef,
  type = "text",
  placeholder = "-",
  showWarning = false,
  warningTooltip,
  fontWeight = 400,
  formatDisplay,
  onStartEdit,
  onEditValueChange,
  onBlur,
  onKeyDown,
}) => {
  if (isEditing) {
    return (
      <TextField
        inputRef={inputRef}
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        size="small"
        variant="standard"
        type={type}
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

  const displayValue = formatDisplay ? formatDisplay(value) : (value ?? "");

  return (
    <Box
      onClick={onStartEdit}
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
          fontWeight,
        }}
      >
        {displayValue || placeholder}
      </Typography>
    </Box>
  );
};
