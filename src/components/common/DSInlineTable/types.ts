import { DSSelectOption } from "../cells/DSSelectCell";

// Edit types for inline editing
export type EditType = "text" | "number" | "select" | "date" | "autocomplete";

// Filter types for column-level filtering
export type FilterType =
  | "text"
  | "select"
  | "multiselect"
  | "number-range"
  | "date-range";

// Filter configuration for a column
export interface ColumnFilterConfig<T extends { id: string | number }> {
  type: FilterType;
  // Options for select/multiselect - static array or dynamic function
  options?:
    | DSSelectOption<string>[]
    | ((data: T[]) => DSSelectOption<string>[]);
  // Custom placeholder for text filter
  placeholder?: string;
  // Custom labels for range filters
  minLabel?: string;
  maxLabel?: string;
  fromLabel?: string;
  toLabel?: string;
}

// Filter value types
export interface TextFilterValue {
  text: string;
}

export interface SelectFilterValue {
  value: string;
}

export interface MultiselectFilterValue {
  values: string[];
}

export interface NumberRangeFilterValue {
  min?: number;
  max?: number;
}

export interface DateRangeFilterValue {
  from?: Date | null;
  to?: Date | null;
}

// Filter state for each column
export interface ColumnFilterState {
  columnId: string;
  type: FilterType;
  value:
    | TextFilterValue
    | SelectFilterValue
    | MultiselectFilterValue
    | NumberRangeFilterValue
    | DateRangeFilterValue;
}

// Resolved filter config with computed options
export interface ResolvedColumnFilterConfig<T extends { id: string | number }>
  extends Omit<ColumnFilterConfig<T>, "options"> {
  columnId: string;
  resolvedOptions?: DSSelectOption<string>[];
}

// Column definition for inline table
export interface InlineColumn<T extends { id: string | number }> {
  id: string;
  label: string;
  editable?: boolean;
  editType?: EditType;
  editOptions?: DSSelectOption<string>[]; // For select type
  editColorMap?: Record<string, string>; // Color map for select options
  autocompleteOptions?: string[]; // For autocomplete type - existing values to suggest
  getValue?: (row: T) => any; // Get raw value for editing
  getSortValue?: (row: T) => any; // Get value for sorting (e.g., numeric index for status)
  render?: (row: T) => React.ReactNode; // Custom render for non-editable or display
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  // Sticky column support for horizontal scroll
  sticky?: boolean;
  stickyOffset?: number; // Left offset for multiple sticky columns
  // Filter configuration
  filterConfig?: ColumnFilterConfig<T>;
}

// Props for the main DSInlineTable component
export interface DSInlineTableProps<T extends { id: string | number }> {
  columns: InlineColumn<T>[];
  data: T[];
  onCellUpdate: (rowId: string | number, field: string, value: any, row: T) => void | Promise<void>;
  showSearch?: boolean;
  searchFields?: string[];
  emptyMessage?: string;
  // Default sort field when no column sorting is applied (e.g., "createdAt")
  defaultSortField?: string;
  // Selection props
  showSelectColumn?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  // Bulk actions slot
  BulkActions?: React.ReactNode;
  // Simple add row props (like DSAddRow - single input)
  enableInlineAdd?: boolean;
  addRowPlaceholder?: string;
  addRowField?: string; // The main field for add input (e.g., "name")
  defaultNewRow?: Partial<Omit<T, "id">>;
  onAddRow?: (newRow: Omit<T, "id">, onSuccess?: (newRowId: string | number) => void) => void;
  // Mobile view props
  mobileCardTitle?: (row: T) => string; // Function to generate card title on mobile
  // Export props
  showExport?: boolean;
  exportFilename?: string;
}

export type Order = "asc" | "desc";
