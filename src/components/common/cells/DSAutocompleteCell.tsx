import React from "react";
import { Box, TextField, Autocomplete, Typography } from "@mui/material";

interface DSAutocompleteCellProps {
  value: string | null | undefined;
  options: string[];
  isEditing: boolean;
  editValue: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  freeSolo?: boolean;
  placeholder?: string;
  onStartEdit: () => void;
  onEditValueChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const DSAutocompleteCell: React.FC<DSAutocompleteCellProps> = ({
  value,
  options,
  isEditing,
  editValue,
  inputRef,
  freeSolo = true,
  placeholder = "-",
  onStartEdit,
  onEditValueChange,
  onBlur,
  onKeyDown,
}) => {
  if (isEditing) {
    return (
      <Autocomplete
        freeSolo={freeSolo}
        options={options}
        value={editValue}
        inputValue={editValue}
        onInputChange={(_, newValue) => onEditValueChange(newValue)}
        onChange={(_, newValue) => onEditValueChange(newValue || "")}
        onBlur={onBlur}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            variant="standard"
            size="small"
            onKeyDown={onKeyDown}
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
      onClick={onStartEdit}
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
          color: value ? "text.primary" : "text.disabled",
        }}
      >
        {value || placeholder}
      </Typography>
    </Box>
  );
};
