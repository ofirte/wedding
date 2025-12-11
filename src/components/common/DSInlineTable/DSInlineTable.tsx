import React, { useCallback, useRef, forwardRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Checkbox,
  Button,
} from "@mui/material";
import { Search, Clear, FilterListOff } from "@mui/icons-material";
import { TableVirtuoso, TableVirtuosoHandle } from "react-virtuoso";
import { useTranslation } from "../../../localization/LocalizationContext";
import { DSInlineTableProps } from "./types";
import { useTableSearch } from "./hooks/useTableSearch";
import { useTableSorting } from "./hooks/useTableSorting";
import { useTableSelection } from "./hooks/useTableSelection";
import { useTableFiltering } from "./hooks/useTableFiltering";
import { renderCellContent } from "./renderCellContent";
import AddRowFooter from "./AddRowFooter";
import ColumnHeaderCell from "./ColumnHeaderCell";
import { TabNavigationProvider, TabNavigationRef } from "./TabNavigationContext";

const DSInlineTable = <T extends { id: string | number }>({
  columns,
  data,
  onCellUpdate,
  showSearch = false,
  searchFields = [],
  emptyMessage,
  defaultSortField,
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

  const virtuosoRef = useRef<TableVirtuosoHandle>(null);
  const tabNavRef = useRef<TabNavigationRef>(null);

  // Stable callback refs - avoid re-creating callbacks when data changes
  const dataRef = useRef(data);
  dataRef.current = data;
  const onCellUpdateRef = useRef(onCellUpdate);
  onCellUpdateRef.current = onCellUpdate;

  // Stable cell update handler - uses refs so deps are empty
  // Returns Promise so Tab navigation can await completion
  const handleCellUpdate = useCallback(
    async (rowId: string | number, columnId: string, value: any) => {
      const row = dataRef.current.find((r) => r.id === rowId);
      if (row) {
        await onCellUpdateRef.current(rowId, columnId, value, row);
      }
    },
    []
  );

  // Use hooks for filtering, search, sorting, and selection
  // Data flow: data → filtering → search → sorting → render
  const {
    filteredData: filterOutputData,
    hasActiveFilters,
    isFilterActive,
    setColumnFilter,
    clearColumnFilter,
    clearAllFilters,
    getFilterState,
    getResolvedFilterConfig,
  } = useTableFiltering(data, columns);

  const { searchQuery, setSearchQuery, filteredData, searchPlaceholder } =
    useTableSearch(filterOutputData, searchFields, columns, t);

  const { orderBy, order, sortedData, handleRequestSort } =
    useTableSorting(filteredData, defaultSortField, "desc");

  const { selectedIdSet, allSelected, someSelected, handleRowSelect, handleSelectAll } =
    useTableSelection(sortedData, selectedRows, onSelectionChange);

  // Scroll to top and focus first cell - called after adding a new row
  // New rows appear at top due to descending sort by createdAt
  // focusFirstCellInRow has retry logic to wait for cell registration
  const handleNewRowAdded = useCallback((newRowId: string | number) => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      behavior: "smooth",
      align: "start",
    });
    tabNavRef.current?.focusFirstCellInRow(newRowId);
  }, []);

  // Stable callback for adding a row - receives value from AddRowFooter
  const handleAddRow = useCallback((value: string) => {
    if (!onAddRow) return;

    const newRow: Record<string, any> = { ...defaultNewRow };
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
    newRow[addRowField] = value;

    onAddRow(newRow as Omit<T, "id">, handleNewRowAdded);
  }, [onAddRow, defaultNewRow, columns, addRowField, handleNewRowAdded]);

  const totalColumns = showSelectColumn ? columns.length + 1 : columns.length;

  return (
    <TabNavigationProvider ref={tabNavRef} columns={columns}>
      <Box>
        {/* Bulk Actions Bar */}
      {showSelectColumn && selectedRows.length > 0 && BulkActions && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "primary.light",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "primary.contrastText" }}
          >
            {t("common.selected", { count: selectedRows.length })}
          </Typography>
          {BulkActions}
        </Box>
      )}

      {showSearch && searchFields.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", gap: 1, alignItems: "center" }}>
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
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<FilterListOff />}
              onClick={clearAllFilters}
              sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {t("common.clearFilters")}
            </Button>
          )}
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
        {sortedData.length === 0 && !enableInlineAdd ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {emptyMessage || t("common.noResultsFound")}
            </Typography>
          </Box>
        ) : (
          <TableVirtuoso
            ref={virtuosoRef}
            style={{ height: "60vh" }}
            data={sortedData}
            overscan={10}
            components={{
              Table: (props) => (
                <Table
                  {...props}
                  size="small"
                  stickyHeader
                  sx={{
                    minWidth: "max-content",
                    "& tbody tr:hover": { bgcolor: "action.hover" },
                  }}
                />
              ),
              TableHead: forwardRef<HTMLTableSectionElement>((props, ref) => (
                <TableHead ref={ref} {...props} />
              )),
              TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
                <TableBody ref={ref} {...props} />
              )),
            }}
            itemContent={(_index, row) => (
              <>
                {showSelectColumn && (
                  <TableCell
                    padding="checkbox"
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <Checkbox
                      checked={selectedIdSet.has(row.id)}
                      onChange={(e) => handleRowSelect(row, e.target.checked)}
                    />
                  </TableCell>
                )}
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
                    {renderCellContent(column, row, handleCellUpdate)}
                  </TableCell>
                ))}
              </>
            )}
            fixedHeaderContent={() => (
              <TableRow>
                {showSelectColumn && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      bgcolor: "#f5f5f5",
                      fontWeight: "bold",
                      width: 48,
                    }}
                  >
                    <Checkbox
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const filterConfig = getResolvedFilterConfig(column.id);
                  const filterState = getFilterState(column.id);
                  const filterActive = isFilterActive(column.id);

                  return (
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
                          zIndex: 3,
                          borderRight: "2px solid",
                          borderRightColor: "divider",
                          boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
                        }),
                      }}
                    >
                      <ColumnHeaderCell
                        column={column}
                        orderBy={orderBy}
                        order={order}
                        onRequestSort={handleRequestSort}
                        filterConfig={filterConfig}
                        filterState={filterState}
                        isFilterActive={filterActive}
                        onFilterChange={setColumnFilter}
                        onFilterClear={clearColumnFilter}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
            fixedFooterContent={
              enableInlineAdd
                ? () => (
                    <AddRowFooter
                      totalColumns={totalColumns}
                      placeholder={addRowPlaceholder || t("common.addNew")}
                      onAddRow={handleAddRow}
                    />
                  )
                : undefined
            }
          />
        )}
        </Box>
      </Box>
    </TabNavigationProvider>
  );
};

export default DSInlineTable;
