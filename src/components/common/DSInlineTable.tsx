import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { Search, Clear, Add } from "@mui/icons-material";
import { useTableCellEditing, TypeConverter } from "./hooks/useTableCellEditing";
import { DSEditableTextCell, DSEditableTextCellType } from "./cells/DSEditableTextCell";
import { DSSelectCell, DSSelectOption } from "./cells/DSSelectCell";
import { useTranslation } from "../../localization/LocalizationContext";

// Edit types for inline editing
export type EditType = "text" | "number" | "select" | "date";

// Column definition for inline table
export interface InlineColumn<T extends { id: string | number }> {
  id: string;
  label: string;
  editable?: boolean;
  editType?: EditType;
  editOptions?: DSSelectOption<string>[]; // For select type
  editColorMap?: Record<string, string>; // Color map for select options
  getValue?: (row: T) => any; // Get raw value for editing
  render?: (row: T) => React.ReactNode; // Custom render for non-editable or display
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  // Sticky column support for horizontal scroll
  sticky?: boolean;
  stickyOffset?: number; // Left offset for multiple sticky columns
}

interface DSInlineTableProps<T extends { id: string | number }> {
  columns: InlineColumn<T>[];
  data: T[];
  onCellUpdate: (rowId: string | number, field: string, value: any, row: T) => void;
  showSearch?: boolean;
  searchFields?: string[];
  emptyMessage?: string;
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
  onAddRow?: (newRow: Omit<T, "id">) => void;
}

type Order = "asc" | "desc";

const DSInlineTable = <T extends { id: string | number }>({
  columns,
  data,
  onCellUpdate,
  showSearch = false,
  searchFields = [],
  emptyMessage,
  showSelectColumn = false,
  selectedRows = [],
  onSelectionChange,
  BulkActions,
  enableInlineAdd = false,
  addRowPlaceholder,
  addRowField = "name",
  defaultNewRow = {},
  onAddRow,
}: DSInlineTableProps<T>) => {
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Simple add row state (single input like DSAddRow)
  const [newRowValue, setNewRowValue] = useState("");
  const newRowInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddRow = useCallback(() => {
    if (!newRowValue.trim() || !onAddRow) return;

    // Build new row with defaults + the main field value
    const newRow: Record<string, any> = { ...defaultNewRow };
    // Set defaults for each editable column
    columns.forEach((col) => {
      if (col.editable && newRow[col.id] === undefined) {
        if (col.editType === "number") {
          newRow[col.id] = 0;
        } else if (col.editType === "select" && col.editOptions?.length) {
          newRow[col.id] = col.editOptions[0].value;
        } else {
          newRow[col.id] = "";
        }
      }
    });
    // Set the main field value
    newRow[addRowField] = newRowValue.trim();

    onAddRow(newRow as Omit<T, "id">);
    setNewRowValue("");
  }, [newRowValue, onAddRow, defaultNewRow, columns, addRowField]);

  const handleAddRowKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRow();
    }
  }, [handleAddRow]);

  // Selection helpers
  const isRowSelected = useCallback(
    (row: T) => selectedRows.some((r) => r.id === row.id),
    [selectedRows]
  );

  const handleRowSelect = useCallback(
    (row: T, checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        onSelectionChange([...selectedRows, row]);
      } else {
        onSelectionChange(selectedRows.filter((r) => r.id !== row.id));
      }
    },
    [selectedRows, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        onSelectionChange([...data]);
      } else {
        onSelectionChange([]);
      }
    },
    [data, onSelectionChange]
  );

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  // Build type converters for number columns
  const typeConverters = useMemo<TypeConverter<T>[]>(() => {
    return columns
      .filter((col) => col.editable && col.editType === "number")
      .map((col) => ({
        field: col.id as keyof T,
        convert: (value: string) => (value === "" ? 0 : Number(value)),
      }));
  }, [columns]);

  // Get non-editable fields for exclusion
  const excludeFields = useMemo(() => {
    return columns
      .filter((col) => !col.editable)
      .map((col) => col.id as keyof T);
  }, [columns]);

  // Inline editing hook
  const handleCellUpdate = useCallback(
    (id: string | number, field: keyof T, value: any, row: T) => {
      onCellUpdate(id, field as string, value, row);
    },
    [onCellUpdate]
  );

  const {
    editingCell,
    editValue,
    inputRef,
    setEditValue,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
    isEditing,
  } = useTableCellEditing({
    excludeFields,
    typeConverters,
    onUpdate: handleCellUpdate,
  });

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => {
        const value = (row as any)[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[orderBy];
      const bValue = (b as any)[orderBy];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return order === "asc" ? comparison : -comparison;
    });
  }, [filteredData, orderBy, order]);

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  // Render cell content
  const renderCellContent = (column: InlineColumn<T>, row: T) => {
    const fieldId = column.id as keyof T;
    const cellIsEditing = isEditing(row.id, fieldId);
    const rawValue = column.getValue ? column.getValue(row) : (row as any)[column.id];

    // Non-editable column with custom render
    if (!column.editable) {
      return column.render ? column.render(row) : String(rawValue ?? "");
    }

    // Select type - always editable, no click-to-edit needed
    if (column.editType === "select" && column.editOptions) {
      return (
        <DSSelectCell
          value={rawValue || ""}
          options={column.editOptions}
          colorMap={column.editColorMap}
          onChange={(newValue) => onCellUpdate(row.id, column.id, newValue, row)}
        />
      );
    }
    else {
      const editableType: DSEditableTextCellType =
        column.editType === "select"
          ? "text"
          : ((column.editType as DSEditableTextCellType) || "text");

      return (
        <DSEditableTextCell
          value={rawValue}
          isEditing={cellIsEditing}
          editValue={editValue}
          inputRef={inputRef}
          type={editableType}
          onStartEdit={() => handleCellClick(row, fieldId)}
          onEditValueChange={setEditValue}
          onBlur={() => handleCellBlur(row, fieldId)}
          onKeyDown={(e) => handleKeyDown(e, row, fieldId)}
        />
      );
    }
  };

  // Build search placeholder
  const searchPlaceholder = useMemo(() => {
    if (searchFields.length === 0) return "";
    const labels = searchFields
      .map((field) => columns.find((col) => col.id === field)?.label)
      .filter(Boolean);
    return `${t("common.search")} ${labels.join(", ")}...`;
  }, [searchFields, columns, t]);

  return (
    <Box>
      {showSearch && searchFields.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "center"}
                    sx={{
                      bgcolor: "#f5f5f5",
                      fontWeight: "bold",
                      ...(column.minWidth && { minWidth: column.minWidth }),
                      ...(column.width && { width: column.width }),
                      ...(column.sticky && {
                        position: "sticky",
                        left: column.stickyOffset ?? 0,
                        zIndex: 3, // Higher than body cells and stickyHeader
                        borderRight: "2px solid",
                        borderRightColor: "divider",
                        boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
                      }),
                    }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length === 0 && !enableInlineAdd ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      {emptyMessage || t("common.noResultsFound")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || "center"}
                        sx={{
                          py: 1,
                          ...(column.minWidth && { minWidth: column.minWidth }),
                          ...(column.width && { width: column.width }),
                          ...(column.editable && { cursor: "text" }),
                          ...(column.sticky && {
                            position: "sticky",
                            left: column.stickyOffset ?? 0,
                            zIndex: 1,
                            backgroundColor: "background.paper",
                            borderRight: "2px solid",
                            borderRightColor: "divider",
                            boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
                          }),
                        }}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
              {/* Simple Add Row (DSAddRow style) */}
              {enableInlineAdd && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{
                      p: 0,
                      borderTop: "2px dashed",
                      borderColor: "divider",
                      backgroundColor: "#F0F7FF",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#E3F2FD",
                        boxShadow: "inset 3px 0 0 #4285F4",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5 }}>
                      <Add
                        sx={{
                          fontSize: "1.25rem",
                          color: "primary.main",
                          cursor: "pointer",
                          "&:hover": { opacity: 0.7 },
                        }}
                        onClick={handleAddRow}
                      />
                      <TextField
                        inputRef={newRowInputRef}
                        placeholder={addRowPlaceholder || t("common.addNew")}
                        value={newRowValue}
                        onChange={(e) => setNewRowValue(e.target.value)}
                        onKeyDown={handleAddRowKeyDown}
                        size="small"
                        variant="standard"
                        fullWidth
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "primary.main",
                            "& ::placeholder": {
                              color: "primary.main",
                              opacity: 0.7,
                            },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DSInlineTable;
