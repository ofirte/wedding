import { useMemo, useState } from "react";
import { Order, InlineColumn } from "../types";

export const useTableSorting = <T extends { id: string | number }>(
  data: T[],
  columns: InlineColumn<T>[],
  defaultSortField?: string,
  defaultSortOrder: Order = "asc"
) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");

  // Sort data - use defaultSortField when no column sorting is applied
  const sortedData = useMemo(() => {
    const sortField = orderBy || defaultSortField;
    if (!sortField) return data;

    const isDefaultSort = !orderBy && defaultSortField;

    // Find the column to check for custom getSortValue
    const column = columns.find((c) => c.id === sortField);

    return [...data].sort((a, b) => {
      // Use getSortValue if available, otherwise fall back to direct field access
      const aValue = column?.getSortValue ? column.getSortValue(a) : (a as any)[sortField];
      const bValue = column?.getSortValue ? column.getSortValue(b) : (b as any)[sortField];

      if (aValue === bValue) return 0;

      // Handle null/undefined values
      // For default sort: nulls go first (asc) or last (desc) - assuming missing = older
      // For user-selected sort: nulls go to the end
      const effectiveSortOrder = orderBy ? order : defaultSortOrder;
      if (aValue == null) {
        if (isDefaultSort) {
          return effectiveSortOrder === "desc" ? 1 : -1; // nulls last for desc, first for asc
        }
        return 1; // nulls to end for user sort
      }
      if (bValue == null) {
        if (isDefaultSort) {
          return effectiveSortOrder === "desc" ? -1 : 1; // nulls last for desc, first for asc
        }
        return -1; // nulls to end for user sort
      }

      const comparison = aValue < bValue ? -1 : 1;
      return effectiveSortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, columns, orderBy, order, defaultSortField, defaultSortOrder]);

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const resetSort = () => {
    setOrderBy("");
    setOrder("asc");
  };

  return {
    orderBy,
    order,
    sortedData,
    handleRequestSort,
    resetSort,
  };
};
