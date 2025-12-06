import { Column, SearchConfig } from "./DSTable";
import { FilterState } from "./DSTableFilters";

type Order = "asc" | "desc";

/**
 * Applies search query to the data set based on configured columns
 */
export const applySearch = (
  sourceData: any[],
  searchQuery: string,
  searchConfig?: SearchConfig
): any[] => {
  if (!searchQuery.trim() || !searchConfig?.columnIds.length) {
    return sourceData;
  }

  const query = searchQuery.toLowerCase().trim();

  return sourceData.filter((item) =>
    searchConfig.columnIds.some((columnId) => {
      const value = item[columnId];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    })
  );
};

/**
 * Applies active filters to the data set
 */
export const applyFilters = (sourceData: any[], filters: FilterState[]): any[] => {
  const activeFilters = filters.filter(filter => filter.value.length > 0);
  
  if (activeFilters.length === 0) {
    return sourceData;
  }
  
  return sourceData.filter(item => 
    activeFilters.every(filter => {
      const filterValue = item[filter.id];
      return filter.value.includes(filterValue);
    })
  );
};

/**
 * Sorts the data according to the specified column and order
 */
export const sortData = (
  sourceData: any[], 
  columns: Column<any>[], 
  sortBy: string, 
  sortOrder: Order
): any[] => {
  if (!sortBy) {
    return sourceData;
  }
  
  const column = columns.find((col) => col.id === sortBy);
  if (!column || !column.sortable) {
    return sourceData;
  }
  
  return [...sourceData].sort((a, b) => {
    // Use custom sort function if provided
    if (column.sortFn) {
      return sortOrder === "asc" ? column.sortFn(a, b) : column.sortFn(b, a);
    }
    
    // Default sort based on property values
    const aValue = a[sortBy] ?? "";
    const bValue = b[sortBy] ?? "";
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Numeric comparison
    return sortOrder === "asc"
      ? (aValue > bValue ? 1 : -1)
      : (bValue > aValue ? 1 : -1);
  });
};

/**
 * Resolves filter options (static or function-based)
 */
export const resolveFilterOptions = (
  config: any, 
  tableData: any[]
): { value: any; label: string }[] => {
  if (!config.options) return [];
  
  return typeof config.options === 'function'
    ? config.options(tableData)
    : config.options;
};