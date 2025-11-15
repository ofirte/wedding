import React from "react";
import { Box, TextField, Autocomplete, Typography } from "@mui/material";
import { Lead } from "@wedding-plan/types";

interface ServiceCellProps {
  lead: Lead;
  isEditing: boolean;
  editValue: string;
  serviceOptions: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  onCellClick: (lead: Lead, field: keyof Lead) => void;
  onEditValueChange: (value: string) => void;
  onBlur: (lead: Lead, field: string) => void;
  onKeyDown: (e: React.KeyboardEvent, lead: Lead, field: string) => void;
}

export const ServiceCell: React.FC<ServiceCellProps> = ({
  lead,
  isEditing,
  editValue,
  serviceOptions,
  inputRef,
  onCellClick,
  onEditValueChange,
  onBlur,
  onKeyDown,
}) => {
  if (isEditing) {
    return (
      <Autocomplete
        freeSolo
        options={serviceOptions}
        value={editValue}
        inputValue={editValue}
        onInputChange={(e, newValue) => onEditValueChange(newValue)}
        onChange={(e, newValue) => onEditValueChange(newValue || "")}
        onBlur={() => onBlur(lead, "service")}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            variant="standard"
            size="small"
            onKeyDown={(e) => onKeyDown(e, lead, "service")}
            InputProps={{
              ...params.InputProps,
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
        )}
        sx={{ width: "100%" }}
      />
    );
  }

  return (
    <Box
      onClick={() => onCellClick(lead, "service")}
      sx={{
        cursor: "text",
        borderRadius: "6px",
        transition: "background-color 0.15s ease",
        px: 0.5,
        py: 0.5,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
      }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontSize: "0.875rem",
          color: lead.service ? "text.primary" : "text.disabled",
        }}
      >
        {lead.service || "-"}
      </Typography>
    </Box>
  );
};
