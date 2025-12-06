import React from "react";
import { Box, TextField } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface DSAddRowProps {
  value: string;
  placeholder: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange: (value: string) => void;
  onAdd: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const DSAddRow: React.FC<DSAddRowProps> = ({
  value,
  placeholder,
  inputRef,
  onChange,
  onAdd,
  onKeyDown,
}) => {
  return (
    <Box
      sx={{
        borderTop: "2px dashed",
        borderColor: "divider",
        backgroundColor: "#F0F7FF",
        transition: "all 0.2s ease",
        px: 2,
        py: 1.5,
        "&:hover": {
          backgroundColor: "#E3F2FD",
          boxShadow: "inset 3px 0 0 #4285F4",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AddIcon
          sx={{
            fontSize: "1.25rem",
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { opacity: 0.7 },
          }}
          onClick={onAdd}
        />
        <TextField
          inputRef={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          size="small"
          variant="standard"
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "primary.main",
              "& ::placeholder": {
                color: "primary.main",
                opacity: 0.7,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};
