import React, { useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import { Select, MenuItem, Chip, Box } from "@mui/material";

export interface DSSelectOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

export interface DSSelectCellRef {
  focus: () => void;
}

interface DSSelectCellProps<T extends string> {
  value: T;
  options: DSSelectOption<T>[];
  colorMap?: Record<T, string>;
  onChange: (newValue: T) => void | Promise<void>;
  onTabNext?: () => void;
  onTabPrev?: () => void;
}

const DSSelectCellInner = <T extends string>(
  {
    value,
    options,
    colorMap,
    onChange,
    onTabNext,
    onTabPrev,
  }: DSSelectCellProps<T>,
  ref: React.Ref<DSSelectCellRef>
) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Store pending update promise so handleClose can await it
  const pendingUpdateRef = useRef<Promise<void> | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      // Focus the select element
      const selectElement = selectRef.current?.querySelector('[role="combobox"]') as HTMLElement;
      selectElement?.focus();
      setIsFocused(true);
    },
  }));

  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      if (e.shiftKey && onTabPrev) {
        onTabPrev();
      } else if (!e.shiftKey && onTabNext) {
        onTabNext();
      }
    }
    // Enter when closed opens dropdown (default MUI behavior)
    // Enter when open selects value (handled by onChange + onClose below)
  }, [onTabNext, onTabPrev]);

  const handleChange = useCallback((newValue: T) => {
    // Store the promise so handleClose can await it
    const result = onChange(newValue);
    pendingUpdateRef.current = result instanceof Promise ? result : Promise.resolve();
  }, [onChange]);

  const handleClose = useCallback(async () => {
    setIsOpen(false);
    // If there's a pending update, await it before navigating
    if (pendingUpdateRef.current) {
      await pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      // Navigate after update completes
      setTimeout(() => {
        onTabNext?.();
      }, 50);
    }
  }, [onTabNext]);

  const getColor = (val: T): string => {
    if (colorMap) return colorMap[val];
    const option = options.find((o) => o.value === val);
    return option?.color ?? "#9E9E9E";
  };

  const getLabel = (val: T): string => {
    // Find matching option and return its label
    const option = options.find((o) => o.value === val);
    return option?.label ?? String(val);
  };

  return (
    <Box
      onKeyDownCapture={handleKeyNavigation}
      sx={{ width: "100%" }}
    >
      <Select
        ref={selectRef}
        value={value}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={handleClose}
        onChange={(e) => handleChange(e.target.value as T)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        size="small"
        variant="standard"
        disableUnderline
        fullWidth
        displayEmpty
        renderValue={(val) => getLabel(val)}
        MenuProps={{
          // Prevent MUI from stealing focus back after dropdown closes
          disableRestoreFocus: true,
          // Capture Tab/Enter events from the dropdown menu
          MenuListProps: {
            onKeyDownCapture: handleKeyNavigation,
          },
        }}
        sx={{
          borderRadius: "8px",
          ...(isFocused && {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
          }),
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1.5,
            backgroundColor: getColor(value),
            color: "white",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.813rem",
            transition: "all 0.2s ease",
            "&:hover": {
              opacity: 0.9,
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <Chip
            label={option.label}
            size="small"
            sx={{
              backgroundColor: option.color ?? colorMap?.[option.value] ?? "#9E9E9E",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </MenuItem>
      ))}
      </Select>
    </Box>
  );
};

// Export with forwardRef - using type assertion for generic component
export const DSSelectCell = forwardRef(DSSelectCellInner) as <T extends string>(
  props: DSSelectCellProps<T> & { ref?: React.Ref<DSSelectCellRef> }
) => React.ReactElement;
