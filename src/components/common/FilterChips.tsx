import React from "react";
import { Chip, Stack } from "@mui/material";
import { FilterState } from "./DSTableFilters";

interface FilterChipsProps {
  filters: FilterState[];
  onRemoveFilterValue: (filterId: string, value: any) => void;
}

/**
 * FilterChips component - displays the active filter selections as chips
 */
const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilterValue,
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
    </Stack>
  );
};

export default FilterChips;
