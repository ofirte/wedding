import React, { useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterChips from "./FilterChips";
import FilterPopover from "./FilterPopover";

export interface FilterConfig {
  id: string;
  type: "single" | "multiple";
  label: string;
  options?:
    | {
        value: any;
        label: string;
      }[]
    | ((data: any[]) => { value: any; label: string }[]);
  displayFormat?: (value: any) => string;
}

export interface ResolvedFilterConfig extends FilterConfig {
  resolvedOptions: { value: any; label: string }[];
}

export interface FilterState {
  id: string;
  value: any[];
}

interface DSTableFiltersProps {
  filters: FilterState[];
  filterConfigs: ResolvedFilterConfig[];
  setFilterStates: React.Dispatch<React.SetStateAction<FilterState[]>>;
}

const DSTableFilters: React.FC<DSTableFiltersProps> = ({
  filters,
  filterConfigs,
  setFilterStates,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpenFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilters = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (filterId: string, newValue: any[]) => {
    setFilterStates((prevStates) => {
      const existingFilterIndex = prevStates.findIndex(
        (state) => state.id === filterId
      );

      if (existingFilterIndex === -1) {
        return [...prevStates, { id: filterId, value: newValue }];
      } else {
        if (newValue.length === 0) {
          return prevStates.filter((state) => state.id !== filterId);
        }
        return prevStates.map((state) =>
          state.id === filterId ? { ...state, value: newValue } : state
        );
      }
    });
  };

  const handleClearFilters = () => {
    setFilterStates([]);
  };

  const handleRemoveFilterValue = (filterId: string, value: any) => {
    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    const newValues = filter.value.filter((v) => v !== value);
    handleFilterChange(filterId, newValues);
  };

  const getActiveFiltersCount = () => {
    return filters.reduce((count, filter) => count + filter.value.length, 0);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<FilterAltIcon />}
          onClick={handleOpenFilters}
          variant="outlined"
          color={getActiveFiltersCount() > 0 ? "primary" : "inherit"}
          sx={{ height: 32 }}
        >
          Filters{" "}
          {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>

        <FilterChips
          filters={filters}
          onRemoveFilterValue={handleRemoveFilterValue}
        />

        {getActiveFiltersCount() > 0 && (
          <Button size="small" onClick={handleClearFilters} sx={{ height: 32 }}>
            Clear all
          </Button>
        )}
      </Stack>

      <FilterPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilters}
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
      />
    </Box>
  );
};

export default DSTableFilters;
