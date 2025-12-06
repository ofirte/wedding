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
import { ResolvedFilterConfig, FilterState } from "./DSTableFilters";
import { useTranslation } from "../../localization/LocalizationContext";

interface FilterPopoverProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  filters: FilterState[];
  filterConfigs: ResolvedFilterConfig[];
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
  const { t } = useTranslation();

  const handleFilterChange = (
    filterId: string,
    event: SelectChangeEvent<any>
  ) => {
    const newValue = event.target.value;
    const filterConfig = filterConfigs.find(
      (config: ResolvedFilterConfig) => config.id === filterId
    );

    // Always handle as array for consistency
    const valueAsArray =
      filterConfig?.type === "multiple"
        ? newValue
        : newValue === ""
        ? []
        : [newValue];
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
            {t("common.filters")}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {filterConfigs.map((filterConfig: ResolvedFilterConfig) => {
          const filterValues = filters.find((f) => f.id === filterConfig.id);
          return (
            <FormControl key={filterConfig.id} fullWidth size="small">
              <InputLabel>{filterConfig.label}</InputLabel>
              <Select
                multiple={filterConfig.type === "multiple"}
                value={
                  filterConfig.type === "multiple"
                    ? filterValues?.value ?? []
                    : filterValues?.value?.[0] || ""
                }
                onChange={(e) => handleFilterChange(filterConfig.id, e)}
                label={filterConfig.label}
                renderValue={
                  filterConfig.type === "multiple"
                    ? (selected) => t("common.selected", { count: (selected as any[]).length })
                    : undefined
                }
              >
                {filterConfig.type === "single" && (
                  <MenuItem value="">
                    <em>{t("common.all")}</em>
                  </MenuItem>
                )}

                {filterConfig.resolvedOptions?.map((option, index) => (
                  <MenuItem
                    key={`${filterConfig.id}-option-${index}`}
                    value={option.value}
                  >
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
