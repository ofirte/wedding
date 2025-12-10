import React from "react";
import { Select, MenuItem, Chip } from "@mui/material";

export interface DSSelectOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface DSSelectCellProps<T extends string> {
  value: T;
  options: DSSelectOption<T>[];
  colorMap?: Record<T, string>;
  onChange: (newValue: T) => void;
}

export const DSSelectCell = <T extends string>({
  value,
  options,
  colorMap,
  onChange,
}: DSSelectCellProps<T>) => {
  const getColor = (val: T): string => {
    if (colorMap) return colorMap[val];
    const option = options.find((o) => o.value === val);
    return option?.color ?? "#9E9E9E";
  };

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      size="small"
      variant="standard"
      disableUnderline
      fullWidth
      sx={{
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
  );
};
