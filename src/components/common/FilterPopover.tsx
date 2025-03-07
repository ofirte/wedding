import React from "react";
import {
  Box,
  IconButton,
  Popover,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FilterConfig, FilterState } from "./DSTableFilters";

interface FilterPopoverProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  filters: FilterState[];
  filterConfigs: FilterConfig[];
  onFilterChange: (filterId: string, newValue: any[]) => void;
}

/**
 * FilterPopover component - handles the filter selection menu
 */
const FilterPopover: React.FC<FilterPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  filters,
  filterConfigs,
  onFilterChange,
}) => {
  const handleFilterChange = (filterId: string, event: SelectChangeEvent<any>) => {
    const newValue = event.target.value;
    const filterConfig = filterConfigs.find((config: FilterConfig) => config.id === filterId);
    
    // Always handle as array for consistency
    const valueAsArray = filterConfig?.type === "multiple" 
      ? newValue 
      : newValue === "" ? [] : [newValue];
    
    onFilterChange(filterId, valueAsArray);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Filters
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Divider />
        
        {filters.map((filter: FilterState) => {
          const filterConfig = filterConfigs.find((config: FilterConfig) => config.id === filter.id);
          if (!filterConfig) return null;

          return (
            <FormControl key={filter.id} fullWidth size="small">
              <InputLabel>{filterConfig.label}</InputLabel>
              <Select
                multiple={filterConfig.type === "multiple"}
                value={filterConfig.type === "multiple" ? filter.value : filter.value[0] || ""}
                onChange={(e) => handleFilterChange(filter.id, e)}
                label={filterConfig.label}
                renderValue={
                  filterConfig.type === "multiple"
                    ? (selected) => `${(selected as any[]).length} selected`
                    : undefined
                }
              >
                {filterConfig.type === "single" && (
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                )}
                
                {filter.resolvedOptions?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })}
      </Stack>
    </Popover>
  );
};

export default FilterPopover;