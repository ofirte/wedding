import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import { Box, TextField, Typography, Autocomplete } from "@mui/material";
import { useTabNavigationOptional } from "../TabNavigationContext";

interface MemoizedAutocompleteCellProps {
  rowId: string | number;
  columnId: string;
  value: string;
  options: string[];
  onCellUpdate: (rowId: string | number, columnId: string, value: any) => void | Promise<void>;
}

export const MemoizedAutocompleteCell = memo(({
  rowId,
  columnId,
  value,
  options,
  onCellUpdate
}: MemoizedAutocompleteCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const tabNav = useTabNavigationOptional();

  // Ref to access latest value without causing re-registration
  const valueRef = useRef(value);
  valueRef.current = value;

  // Track when Tab navigation is happening to skip blur handler
  const isTabNavigatingRef = useRef(false);
  // Protect focus from blur for a short time after programmatic focus
  const focusProtectedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register cell with tab navigation context
  useEffect(() => {
    if (tabNav) {
      tabNav.registerCell(rowId, columnId, {
        focus: () => {
          focusProtectedRef.current = true;
          setIsEditing(true);
          setInputValue(valueRef.current || "");
          // Clear protection after 1 second
          setTimeout(() => {
            focusProtectedRef.current = false;
          }, 1000);
        },
      });
      return () => tabNav.unregisterCell(rowId, columnId);
    }
  }, [tabNav, rowId, columnId]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setInputValue(value || "");
  }, [value]);

  const handleChange = useCallback(
    async (_event: React.SyntheticEvent, newValue: string | null, reason: string) => {
      // Only handle selection from dropdown, not clearing
      if (reason === "selectOption" || reason === "createOption") {
        // Mark to skip blur handler
        isTabNavigatingRef.current = true;
        if (newValue !== value) {
          await onCellUpdate(rowId, columnId, newValue || "");
        }
        setIsEditing(false);
        // Navigate to next cell after selection
        setTimeout(() => {
          tabNav?.focusNextCell(rowId, columnId);
        }, 50);
      }
      // For "clear" reason, just update inputValue (already handled by onInputChange)
    },
    [rowId, columnId, value, onCellUpdate, tabNav]
  );

  const commitValue = useCallback(async () => {
    if (inputValue !== value) {
      await onCellUpdate(rowId, columnId, inputValue);
    }
  }, [rowId, columnId, value, inputValue, onCellUpdate]);

  const handleBlur = useCallback(async () => {
    // Skip if Tab navigation already handled commit
    if (isTabNavigatingRef.current) {
      isTabNavigatingRef.current = false;
      return;
    }
    // If focus is protected, don't close
    if (focusProtectedRef.current) {
      return;
    }
    await commitValue();
    setIsEditing(false);
  }, [commitValue]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Mark to skip blur handler (same as Tab)
      isTabNavigatingRef.current = true;
      await commitValue();
      setIsEditing(false);
      // Delay focus until after React unmounts current cell
      setTimeout(() => {
        tabNav?.focusNextCell(rowId, columnId);
      }, 0);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    } else if (e.key === "Tab" && tabNav) {
      e.preventDefault();
      // Mark that Tab navigation is handling this - skip blur handler
      isTabNavigatingRef.current = true;
      // AWAIT the update before navigating
      await commitValue();
      setIsEditing(false);
      // Delay focus until after React unmounts current cell
      setTimeout(() => {
        if (e.shiftKey) {
          tabNav.focusPrevCell(rowId, columnId);
        } else {
          tabNav.focusNextCell(rowId, columnId);
        }
      }, 0);
    }
  }, [commitValue, tabNav, rowId, columnId]);

  if (isEditing) {
    return (
      <Autocomplete
        freeSolo
        options={options}
        value={value || ""}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            autoFocus
            size="small"
            variant="standard"
            InputProps={{
              ...params.InputProps,
              disableUnderline: false,
              sx: { fontSize: "0.875rem" },
            }}
          />
        )}
        size="small"
        sx={{
          minWidth: 120,
          width: "100%",
          "& .MuiAutocomplete-input": {
            textAlign: "center",
          }
        }}
        slotProps={{
          popper: {
            placement: "bottom-start",
          }
        }}
      />
    );
  }

  return (
    <Box
      onClick={handleStartEdit}
      sx={{
        cursor: "text",
        minHeight: 24,
        minWidth: 60,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          bgcolor: "action.hover",
          borderRadius: 0.5,
        },
      }}
    >
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
});
