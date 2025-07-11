import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  Button,
  Box,
} from "@mui/material";
import { FC, useState, useEffect, useMemo } from "react";
import {
  ResolvedFilterConfig,
  FilterConfig,
  FilterState,
} from "./DSTableFilters";
import DSTableFilters from "./DSTableFilters";
import TableHeader from "./TableHeader";
import TableContent from "./TableContent";
import { applyFilters, sortData, resolveFilterOptions } from "./DSTableUtils";
import { useExcelExport } from "../../utils/ExcelUtils";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "../../localization/LocalizationContext";

export type Column<T extends { id: string | number }> = {
  render: (row: T) => React.ReactNode;
  id: string;
  label: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  filterConfig?: FilterConfig;
};

type DSTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  data: T[];
  onRowDelete?: (row: T) => void;
  onDisplayedDataChange?: (data: T[]) => void;
  showExport?: boolean;
  exportFilename?: string;
  showSelectColumn?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  BulkActions?: React.JSX.Element | null;
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({
  columns,
  data,
  onDisplayedDataChange,
  showExport = false,
  exportFilename = "export",
  showSelectColumn = false,
  onSelectionChange,
  BulkActions,
}) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [filterStates, setFilterStates] = useState<FilterState[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { t } = useTranslation();
  const resolvedFilterConfigs = useMemo(
    () =>
      columns
        .filter((column) => column.filterConfig)
        .map((column) => {
          const config = column.filterConfig;
          return {
            ...config,
            resolvedOptions: resolveFilterOptions(config, data),
          } as ResolvedFilterConfig;
        }),
    [columns, data]
  );
  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  useEffect(() => {
    const onFilterSortChange = () => {
      const filteredData = applyFilters(data, filterStates);
      const sortedFilteredData = sortData(
        filteredData,
        columns,
        orderBy,
        order
      );

      setDisplayedData(sortedFilteredData);
      onDisplayedDataChange?.(sortedFilteredData);
    };
    onFilterSortChange();
  }, [filterStates, orderBy, order, data]);

  const handleRowSelect = (row: any, isSelected: boolean) => {
    const newSelectedRows = isSelected
      ? [...selectedRows, row]
      : selectedRows.filter((selectedRow) => selectedRow.id !== row.id);

    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  };

  const handleSelectAll = (isSelected: boolean) => {
    const newSelectedRows = isSelected ? [...displayedData] : [];
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
  };

  const isAllSelected =
    displayedData.length > 0 && selectedRows.length === displayedData.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < displayedData.length;

  // Initialize the Excel export hook
  const { exportData } = useExcelExport(exportFilename);

  // Handle export button click
  const handleExport = () => {
    exportData(displayedData, columns);
  };

  return (
    <>
      {(resolvedFilterConfigs.length > 0 || showExport) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
          }}
        >
          {resolvedFilterConfigs.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <DSTableFilters
                filters={filterStates}
                filterConfigs={resolvedFilterConfigs}
                setFilterStates={setFilterStates}
              />
            </Box>
          )}
          {selectedRows.length > 0 && BulkActions}
          {showExport && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ ml: 2 }}
            >
              {t("common.exportToExcel")}
            </Button>
          )}
        </Box>
      )}

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          borderRadius: 2,
          "& .MuiTableCell-head": {
            bgcolor: "#f5f5f5",
            fontWeight: "bold",
          },
        }}
      >
        <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHeader
            columns={columns}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
            showSelectColumn={showSelectColumn}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
          />

          <TableBody>
            <TableContent
              columns={columns}
              data={displayedData}
              showSelectColumn={showSelectColumn}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DSTable;
