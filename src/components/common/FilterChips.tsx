import React from "react";
import { Chip, Stack } from "@mui/material";
import { FilterConfig, FilterState } from "./DSTableFilters";

interface FilterChipsProps {
  filters: FilterState[];
  filterConfigs: FilterConfig[];
  onRemoveFilterValue: (filterId: string, value: any) => void;
}

/**
 * FilterChips component - displays the active filter selections as chips
 */
const FilterChips: React.FC<FilterChipsProps> = ({ 
  filters, 
  filterConfigs, 
  onRemoveFilterValue 
}) => {
  const getFilterValueDisplay = (filterId: string, value: any): string => {
    const filterConfig = filterConfigs.find((config: FilterConfig) => config.id === filterId);
    if (!filterConfig) return String(value);
    
    // Use custom display format if provided
    if (filterConfig.displayFormat) {
      return filterConfig.displayFormat(value);
    }
    
    // Look up display label from options
    const filter = filters.find((f: FilterState) => f.id === filterId);
    if (filter?.resolvedOptions) {
      const option = filter.resolvedOptions.find((opt) => opt.value === value);
      if (option) return option.label;
    }
    
    return String(value);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexGrow: 1, overflow: "auto" }}>
      {filters.flatMap((filter: FilterState) => 
        filter.value.map((val: any) => (
          <Chip
            key={`${filter.id}-${val}`}
            label={getFilterValueDisplay(filter.id, val)}
            onDelete={() => onRemoveFilterValue(filter.id, val)}
            size="small"
          />
        ))
      )}
    </Stack>
  );
};

export default FilterChips;