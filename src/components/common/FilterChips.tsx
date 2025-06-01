import React from "react";
import { Chip, Stack, Button } from "@mui/material";
import { FilterState } from "./DSTableFilters";

interface FilterChipsProps {
  filters: FilterState[];
  onRemoveFilterValue: (filterId: string, value: any) => void;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

/**
 * FilterChips component - displays the active filter selections as chips
 */
const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilterValue,
  showClearAll = false,
  onClearAll,
}) => {
  const getFilterValueDisplay = (filterId: string, value: any): string => {
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
      {showClearAll && onClearAll && (
        <Button size="small" onClick={onClearAll} sx={{ ml: 1 }}>
          Clear all
        </Button>
      )}
    </Stack>
  );
};

export default FilterChips;
