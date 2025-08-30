import React from "react";
import { Chip, Stack, Button } from "@mui/material";
import { FilterState, ResolvedFilterConfig } from "./DSTableFilters";
import { useTranslation } from "../../localization/LocalizationContext";

interface FilterChipsProps {
  filters: FilterState[];
  filterConfigs?: ResolvedFilterConfig[];
  onRemoveFilterValue: (filterId: string, value: any) => void;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

/**
 * FilterChips component - displays the active filter selections as chips
 */
const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  filterConfigs = [],
  onRemoveFilterValue,
  showClearAll = false,
  onClearAll,
}) => {
  const { t } = useTranslation();

  const getFilterValueDisplay = (filterId: string, value: any): string => {
    const filterConfig = filterConfigs.find((config) => config.id === filterId);

    if (filterConfig) {
      const option = filterConfig.resolvedOptions.find(
        (opt) => opt.value === value
      );
      if (option) {
        return option.label;
      }
    }
    return String(value);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          overflow: "auto",
          maxWidth: ({ spacing }) => spacing(30),
          flexShrink: 1,
        }}
      >
        {filters.flatMap((filter: FilterState) =>
          filter.value.map((val: any) => (
            <Chip
              key={`${filter.id}-${val}`}
              sx={{
                bgcolor: ({ palette }) => palette.primary.light,
                color: ({ palette }) => palette.primary.contrastText,
                flexShrink: 0,
              }}
              label={getFilterValueDisplay(filter.id, val)}
              onDelete={() => onRemoveFilterValue(filter.id, val)}
              size="small"
            />
          ))
        )}
      </Stack>
      {showClearAll && onClearAll && (
        <Button size="small" onClick={onClearAll} sx={{ flexShrink: 0 }}>
          {t("common.clearAll")}
        </Button>
      )}
    </Stack>
  );
};

export default FilterChips;
