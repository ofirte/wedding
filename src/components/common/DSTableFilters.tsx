// GenericTableFilters.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Popover,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";


export interface FilterConfig {
  id: string; 
  type: "single" | "multiple" | "range"; 
  label: string
  value: any;
  options?: {
    value: any; 
    label: string; 
  }[];
  displayFormat?: (value: any) => string; 
}

interface DSTableFiltersProps<T> {
  filters: FilterConfig[]; // Array of filter configurations
  onFilterChange: (filterId: string, newValue: any) => void; // Callback when a filter changes
  onClearFilters: () => void; // Callback to clear all filters
}

const DSTableFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
}: DSTableFiltersProps<any>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getActiveFiltersCount = () => {
    return filters.filter((filter) => {
      if (Array.isArray(filter.value)) return filter.value.length > 0;
      return (
        filter.value !== "" &&
        filter.value !== null &&
        filter.value !== undefined
      );
    }).length;
  };

  const handleFilterChange = (
    filterId: string,
    event: SelectChangeEvent<any>
  ) => {
    onFilterChange(filterId, event.target.value);
  };

  const handleRemoveFilterValue = (filterId: string, value: any) => {
    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    if (filter.type === "multiple") {
      const newValues = (filter.value as any[]).filter((v) => v !== value);
      onFilterChange(filterId, newValues);
    } else {
      onFilterChange(filterId, "");
    }
  };

  const getFilterValueDisplay = (filter: FilterConfig, value: any): string => {
    if (filter.displayFormat) {
      return filter.displayFormat(value);
    }

    if (filter.options) {
      const option = filter.options.find((opt) => opt.value === value);
      if (option) return option.label;
    }

    return String(value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<FilterAltIcon />}
          onClick={handleClick}
          variant="outlined"
          color={getActiveFiltersCount() > 0 ? "primary" : "inherit"}
          sx={{ height: 32 }}
        >
          Filters{" "}
          {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>

        <Stack
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1, overflow: "auto" }}
        >
          {filters.map((filter) => {
            if (filter.type === "multiple" && Array.isArray(filter.value)) {
              return filter.value.map((val) => (
                <Chip
                  key={`${filter.id}-${val}`}
                  label={getFilterValueDisplay(filter, val)}
                  onDelete={() => handleRemoveFilterValue(filter.id, val)}
                  size="small"
                />
              ));
            } else if (filter.value && filter.value !== "") {
              return (
                <Chip
                  key={filter.id}
                  label={getFilterValueDisplay(filter, filter.value)}
                  onDelete={() =>
                    handleRemoveFilterValue(filter.id, filter.value)
                  }
                  size="small"
                />
              );
            }
            return null;
          })}
        </Stack>

        {getActiveFiltersCount() > 0 && (
          <Button size="small" onClick={onClearFilters} sx={{ height: 32 }}>
            Clear all
          </Button>
        )}
      </Stack>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: 320,
            p: 2,
            mt: 1,
          },
        }}
      >
        <Stack spacing={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Filters
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          {filters.map((filter) => (
            <FormControl key={filter.id} fullWidth size="small">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                multiple={filter.type === "multiple"}
                value={filter.value}
                onChange={(e) => handleFilterChange(filter.id, e)}
                label={filter.label}
                renderValue={
                  filter.type === "multiple"
                    ? (selected) => `${(selected as any[]).length} selected`
                    : undefined
                }
              >
                {filter.type !== "range" && (
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                )}
                {filter.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </Popover>
    </Box>
  );
};

export default DSTableFilters;
