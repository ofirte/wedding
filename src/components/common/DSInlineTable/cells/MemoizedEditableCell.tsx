import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { useTabNavigationOptional } from "../TabNavigationContext";
import { useTranslation } from "../../../../localization/LocalizationContext";

interface MemoizedEditableCellProps {
  rowId: string | number;
  columnId: string;
  value: any;
  type: "text" | "number" | "date";
  onCellUpdate: (rowId: string | number, columnId: string, value: any) => void | Promise<void>;
}

export const MemoizedEditableCell = memo(({
  rowId,
  columnId,
  value,
  type,
  onCellUpdate
}: MemoizedEditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const tabNav = useTabNavigationOptional();
  const { language } = useTranslation();

  // Map language to locale for date formatting
  const dateLocale = language === "he" ? "he-IL" : "en-US";

  // Ref to access latest value without causing re-registration
  const valueRef = useRef(value);
  valueRef.current = value;

  // Track when Tab navigation is happening to skip blur handler
  const isTabNavigatingRef = useRef(false);
  // Protect focus from blur for a short time after programmatic focus
  const focusProtectedRef = useRef(false);

  // Register cell with tab navigation context
  useEffect(() => {
    if (tabNav) {
      tabNav.registerCell(rowId, columnId, {
        focus: () => {
          focusProtectedRef.current = true;
          setIsEditing(true);
          setEditValue(String(valueRef.current ?? ""));
          // Clear protection after 1 second
          setTimeout(() => {
            focusProtectedRef.current = false;
          }, 1000);
        },
      });
      return () => tabNav.unregisterCell(rowId, columnId);
    }
  }, [tabNav, rowId, columnId]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditValue(String(value ?? ""));
  }, [value]);

  const commitValue = useCallback(async () => {
    const originalValue = String(value ?? "");
    if (editValue !== originalValue) {
      const converted = type === "number" ? (editValue === "" ? 0 : Number(editValue)) : editValue;
      await onCellUpdate(rowId, columnId, converted);
    }
  }, [editValue, value, type, rowId, columnId, onCellUpdate]);

  const handleBlur = useCallback(async () => {
    // Skip if Tab navigation already handled commit
    if (isTabNavigatingRef.current) {
      isTabNavigatingRef.current = false;
      return;
    }
    // If focus is protected, don't close - will be refocused by useEffect
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

  const displayValue = value ?? (type === "number" ? 0 : "");

  const formattedDisplay = type === "date" && displayValue
    ? new Date(displayValue as string).toLocaleDateString(dateLocale)
    : String(displayValue);

  // Container with consistent sizing - TextField is absolutely positioned to prevent width jumping
  return (
    <Box
      onClick={!isEditing ? handleStartEdit : undefined}
      sx={{
        cursor: isEditing ? "default" : "text",
        minHeight: 24,
        minWidth: 60,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        "&:hover": !isEditing ? {
          bgcolor: "action.hover",
          borderRadius: 0.5,
        } : {},
      }}
    >
      {/* Always render Typography to maintain consistent width */}
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          visibility: isEditing ? "hidden" : "visible",
        }}
      >
        {formattedDisplay || "\u00A0"}
      </Typography>

      {/* TextField overlays on top when editing */}
      {isEditing && (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          size="small"
          type={type === "number" ? "number" : type === "date" ? "date" : "text"}
          variant="standard"
          InputProps={{
            disableUnderline: false,
            sx: {
              fontSize: "0.875rem",
            },
          }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "& input": {
              textAlign: "center",
              padding: "0 4px",
              height: "100%",
            },
            "& .MuiInput-root": {
              height: "100%",
            },
          }}
        />
      )}
    </Box>
  );
});
