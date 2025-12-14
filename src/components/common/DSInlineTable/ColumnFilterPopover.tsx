import React, { useState, useCallback, useEffect } from "react";
import {
  Popover,
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import {
  ResolvedColumnFilterConfig,
  ColumnFilterState,
  FilterType,
  TextFilterValue,
  SelectFilterValue,
  MultiselectFilterValue,
  NumberRangeFilterValue,
  DateRangeFilterValue,
} from "./types";
import { useTranslation } from "../../../localization/LocalizationContext";

interface ColumnFilterPopoverProps<T extends { id: string | number }> {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  filterConfig: ResolvedColumnFilterConfig<T>;
  filterState?: ColumnFilterState;
  onFilterChange: (type: FilterType, value: ColumnFilterState["value"]) => void;
  onFilterClear: () => void;
}

const getDefaultValue = (type: FilterType): ColumnFilterState["value"] => {
  switch (type) {
    case "text":
      return { text: "" } as TextFilterValue;
    case "select":
      return { value: "" } as SelectFilterValue;
    case "multiselect":
      return { values: [] } as MultiselectFilterValue;
    case "number-range":
      return { min: undefined, max: undefined } as NumberRangeFilterValue;
    case "date-range":
      return { from: null, to: null } as DateRangeFilterValue;
  }
};

const ColumnFilterPopover = <T extends { id: string | number }>({
  open,
  anchorEl,
  onClose,
  filterConfig,
  filterState,
  onFilterChange,
  onFilterClear,
}: ColumnFilterPopoverProps<T>) => {
  const { t } = useTranslation();

  // Local state for form values
  const [localValue, setLocalValue] = useState<ColumnFilterState["value"]>(
    getDefaultValue(filterConfig.type)
  );

  // Initialize local value when popover opens or filterState changes
  useEffect(() => {
    if (open) {
      setLocalValue(filterState?.value ?? getDefaultValue(filterConfig.type));
    }
  }, [open, filterState, filterConfig.type]);

  const handleApply = useCallback(() => {
    onFilterChange(filterConfig.type, localValue);
    onClose();
  }, [localValue, filterConfig.type, onFilterChange, onClose]);

  const handleClear = useCallback(() => {
    onFilterClear();
    onClose();
  }, [onFilterClear, onClose]);

  const renderFilterContent = () => {
    switch (filterConfig.type) {
      case "text":
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={filterConfig.placeholder || t("common.search")}
            value={(localValue as TextFilterValue)?.text || ""}
            onChange={(e) => setLocalValue({ text: e.target.value })}
            autoFocus
          />
        );

      case "select":
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{t("common.select")}</InputLabel>
            <Select
              value={(localValue as SelectFilterValue)?.value || ""}
              onChange={(e) =>
                setLocalValue({ value: e.target.value as string })
              }
              label={t("common.select")}
            >
              <MenuItem value="">
                <em>{t("common.all")}</em>
              </MenuItem>
              {filterConfig.resolvedOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "multiselect": {
        const selectedValues =
          (localValue as MultiselectFilterValue)?.values || [];
        const toggleOption = (optionValue: string) => {
          const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue];
          setLocalValue({ values: newValues });
        };

        return (
          <Box>
            <List
              dense
              sx={{
                maxHeight: 200,
                overflow: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1.5,
              }}
            >
              {filterConfig.resolvedOptions?.map((option) => (
                <ListItem key={option.value} disablePadding>
                  <ListItemButton
                    onClick={() => toggleOption(option.value)}
                    dense
                    sx={{ py: 0.5 }}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedValues.includes(option.value)}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                    />
                    <ListItemText primary={option.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {selectedValues.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {t("common.selectedCount", { count: selectedValues.length })}
              </Typography>
            )}
          </Box>
        );
      }

      case "number-range":
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={filterConfig.minLabel || t("common.min")}
              value={(localValue as NumberRangeFilterValue)?.min ?? ""}
              onChange={(e) =>
                setLocalValue({
                  ...(localValue as NumberRangeFilterValue),
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label={filterConfig.maxLabel || t("common.max")}
              value={(localValue as NumberRangeFilterValue)?.max ?? ""}
              onChange={(e) =>
                setLocalValue({
                  ...(localValue as NumberRangeFilterValue),
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Stack>
        );

      case "date-range":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <DatePicker
                label={filterConfig.fromLabel || t("common.from")}
                value={(localValue as DateRangeFilterValue)?.from || null}
                onChange={(date) =>
                  setLocalValue({
                    ...(localValue as DateRangeFilterValue),
                    from: date,
                  })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <DatePicker
                label={filterConfig.toLabel || t("common.to")}
                value={(localValue as DateRangeFilterValue)?.to || null}
                onChange={(date) =>
                  setLocalValue({
                    ...(localValue as DateRangeFilterValue),
                    to: date,
                  })
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        );

      default:
        return null;
    }
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
      slotProps={{
        paper: {
          sx: {
            width: 280,
            p: 2,
            mt: 1,
          },
        },
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">
            {t("common.filter")}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {renderFilterContent()}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={handleClear}>
            {t("common.clear")}
          </Button>
          <Button size="small" variant="contained" onClick={handleApply}>
            {t("common.apply")}
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default ColumnFilterPopover;
