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
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({
  columns,
  data,
  onDisplayedDataChange,
  showExport = false,
  exportFilename = "export",
}) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [filterStates, setFilterStates] = useState<FilterState[]>([]);

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
    [columns, data?.length]
  );
  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const onFilterSortChange = () => {
    const filteredData = applyFilters(data, filterStates);
    const sortedFilteredData = sortData(filteredData, columns, orderBy, order);

    setDisplayedData(sortedFilteredData);
    onDisplayedDataChange?.(sortedFilteredData);
  };

  useEffect(() => {
    onFilterSortChange();
  }, [filterStates, orderBy, order, data]);

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

          {showExport && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ ml: 2 }}
            >
              Export to Excel
            </Button>
          )}
        </Box>
      )}

      {resolvedFilterConfigs.length > 0 && !showExport && (
        <DSTableFilters
          filters={filterStates}
          filterConfigs={resolvedFilterConfigs}
          setFilterStates={setFilterStates}
        />
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
        <Table stickyHeader>
          <TableHeader
            columns={columns}
            orderBy={orderBy}
            order={order}
            onRequestSort={handleRequestSort}
          />

          <TableBody>
            <TableContent columns={columns} data={displayedData} />
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DSTable;
