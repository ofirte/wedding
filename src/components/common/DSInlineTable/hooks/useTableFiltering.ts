import { useMemo, useState, useCallback } from "react";
import {
  InlineColumn,
  ColumnFilterState,
  ResolvedColumnFilterConfig,
  FilterType,
  TextFilterValue,
  SelectFilterValue,
  MultiselectFilterValue,
  NumberRangeFilterValue,
  DateRangeFilterValue,
} from "../types";
import { DSSelectOption } from "../../cells/DSSelectCell";

export const useTableFiltering = <T extends { id: string | number }>(
  data: T[],
  columns: InlineColumn<T>[]
) => {
  const [filterStates, setFilterStates] = useState<ColumnFilterState[]>([]);

  // Resolve filter configs - compute dynamic options
  const resolvedFilterConfigs = useMemo((): ResolvedColumnFilterConfig<T>[] => {
    return columns
      .filter((col) => col.filterConfig)
      .map((col) => {
        const config = col.filterConfig!;
        let resolvedOptions: DSSelectOption<string>[] | undefined;

        if (config.options) {
          resolvedOptions =
            typeof config.options === "function"
              ? config.options(data)
              : config.options;
        }

        return {
          columnId: col.id,
          type: config.type,
          placeholder: config.placeholder,
          minLabel: config.minLabel,
          maxLabel: config.maxLabel,
          fromLabel: config.fromLabel,
          toLabel: config.toLabel,
          resolvedOptions,
        };
      });
  }, [columns, data]);

  // Check if a filter is active for a column
  const isFilterActive = useCallback(
    (columnId: string): boolean => {
      const filterState = filterStates.find((f) => f.columnId === columnId);
      if (!filterState) return false;

      switch (filterState.type) {
        case "text":
          return !!(filterState.value as TextFilterValue).text;
        case "select":
          return !!(filterState.value as SelectFilterValue).value;
        case "multiselect":
          return (filterState.value as MultiselectFilterValue).values.length > 0;
        case "number-range": {
          const val = filterState.value as NumberRangeFilterValue;
          return val.min !== undefined || val.max !== undefined;
        }
        case "date-range": {
          const val = filterState.value as DateRangeFilterValue;
          return val.from !== null || val.to !== null;
        }
        default:
          return false;
      }
    },
    [filterStates]
  );

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return filterStates.some((f) => isFilterActive(f.columnId));
  }, [filterStates, isFilterActive]);

  // Update filter for a specific column
  const setColumnFilter = useCallback(
    (columnId: string, type: FilterType, value: ColumnFilterState["value"]) => {
      setFilterStates((prev) => {
        const existingIndex = prev.findIndex((f) => f.columnId === columnId);
        const newState: ColumnFilterState = { columnId, type, value };

        if (existingIndex === -1) {
          return [...prev, newState];
        }

        const updated = [...prev];
        updated[existingIndex] = newState;
        return updated;
      });
    },
    []
  );

  // Clear filter for a specific column
  const clearColumnFilter = useCallback((columnId: string) => {
    setFilterStates((prev) => prev.filter((f) => f.columnId !== columnId));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilterStates([]);
  }, []);

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (filterStates.length === 0) return data;

    return data.filter((row) => {
      return filterStates.every((filterState) => {
        const column = columns.find((c) => c.id === filterState.columnId);
        if (!column) return true;

        const rawValue = column.getValue
          ? column.getValue(row)
          : (row as Record<string, unknown>)[filterState.columnId];

        switch (filterState.type) {
          case "text": {
            const searchText = (
              filterState.value as TextFilterValue
            ).text.toLowerCase();
            if (!searchText) return true;
            return String(rawValue ?? "")
              .toLowerCase()
              .includes(searchText);
          }

          case "select": {
            const selectedValue = (filterState.value as SelectFilterValue)
              .value;
            if (!selectedValue) return true;
            return String(rawValue) === selectedValue;
          }

          case "multiselect": {
            const selectedValues = (filterState.value as MultiselectFilterValue)
              .values;
            if (selectedValues.length === 0) return true;
            return selectedValues.includes(String(rawValue));
          }

          case "number-range": {
            const { min, max } = filterState.value as NumberRangeFilterValue;
            if (min === undefined && max === undefined) return true;
            const numValue = Number(rawValue);
            if (isNaN(numValue)) return false;
            if (min !== undefined && numValue < min) return false;
            if (max !== undefined && numValue > max) return false;
            return true;
          }

          case "date-range": {
            const { from, to } = filterState.value as DateRangeFilterValue;
            if (from === null && to === null) return true;
            if (!rawValue) return false;
            const dateValue = new Date(rawValue as string | number | Date);
            if (isNaN(dateValue.getTime())) return false;
            if (from && dateValue < from) return false;
            if (to && dateValue > to) return false;
            return true;
          }

          default:
            return true;
        }
      });
    });
  }, [data, filterStates, columns]);

  // Get filter state for a column
  const getFilterState = useCallback(
    (columnId: string): ColumnFilterState | undefined => {
      return filterStates.find((f) => f.columnId === columnId);
    },
    [filterStates]
  );

  // Get resolved filter config for a column
  const getResolvedFilterConfig = useCallback(
    (columnId: string): ResolvedColumnFilterConfig<T> | undefined => {
      return resolvedFilterConfigs.find((fc) => fc.columnId === columnId);
    },
    [resolvedFilterConfigs]
  );

  return {
    filterStates,
    filteredData,
    resolvedFilterConfigs,
    hasActiveFilters,
    isFilterActive,
    setColumnFilter,
    clearColumnFilter,
    clearAllFilters,
    getFilterState,
    getResolvedFilterConfig,
  };
};
