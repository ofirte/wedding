import React, { useState, useCallback, useRef, memo } from "react";
import { TableRow, TableCell, Box, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";

interface AddRowFooterProps {
  totalColumns: number;
  placeholder: string;
  onAddRow: (value: string) => void;
}

/**
 * Separate component for add row footer to prevent re-renders
 * when typing. Manages its own local state.
 */
const AddRowFooter = memo(({ totalColumns, placeholder, onAddRow }: AddRowFooterProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return;
    onAddRow(value.trim());
    setValue("");
    // Refocus the input after adding
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [value, onAddRow]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <TableRow>
      <TableCell
        colSpan={totalColumns}
        sx={{
          p: 0,
          borderTop: "2px dashed",
          borderColor: "divider",
          backgroundColor: "#F0F7FF",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#E3F2FD",
            boxShadow: "inset 3px 0 0 #4285F4",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
          }}
        >
          <Add
            sx={{
              fontSize: "1.25rem",
              color: "primary.main",
              cursor: "pointer",
              "&:hover": { opacity: 0.7 },
            }}
            onClick={handleSubmit}
          />
          <TextField
            inputRef={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
      </TableCell>
    </TableRow>
  );
});

AddRowFooter.displayName = "AddRowFooter";

export default AddRowFooter;
