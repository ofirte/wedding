import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { FC, useState, useEffect } from "react";
import { FilterConfig } from "./DSTableFilters";
import DSTableFilters from "./DSTableFilters";

export type Column<T> = {
  render: (row: T) => React.ReactNode;
  id: string;
  label: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  filterConfig?: FilterConfig;
};

type DSTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onRowDelete?: (row: T) => void;
  onDisplayedDataChange?: (data: T[]) => void;
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({ columns, data, onDisplayedDataChange }) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [sortedData, setSortedData] = useState<any[]>(data);
  const [filteredData, setFilteredData] = useState<any[]>(data);
  
  const columnFilters = columns
    .filter(column => column.filterConfig)
    .map(column => column.filterConfig!);

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const handleFilterChange = (filterId: string, newValue: any) => {    
    columns.forEach(column => {
      if (column.filterConfig && column.filterConfig.id === filterId) {
        column.filterConfig.value = newValue;
      }
    });
    applyFilters();
  };

  const handleClearFilters = () => {
    columns.forEach(column => {
      if (column.filterConfig) {
        column.filterConfig.value = column.filterConfig.type === "multiple" ? [] : "";
      }
    });
    applyFilters();
  };

  const applyFilters = () => {
    const activeFilters = columns
      .filter(column => column.filterConfig)
      .map(column => column.filterConfig!)
      .filter(filter => {
        if (Array.isArray(filter.value)) return filter.value.length > 0;
        return filter.value !== "" && filter.value !== null && filter.value !== undefined;
      });

    if (activeFilters.length === 0) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      return activeFilters.every(filter => {
        if (filter.type === "multiple") {
          return filter.value.length === 0 || filter.value.includes(item[filter.id]);
        } else if (filter.type === "range") {
          return true;
        } else {
          return filter.value === "" || item[filter.id] === filter.value;
        }
      });
    });

    setFilteredData(filtered);

  };

  useEffect(() => {
    if (!orderBy) {
      setSortedData(filteredData);
      return;
    }

    const column = columns.find((col) => col.id === orderBy);
    if (!column || !column.sortable) {
      setSortedData(filteredData);
      return;
    }

    const sorted = [...filteredData].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return order === "asc" ? column.sortFn(a, b) : column.sortFn(b, a);
      }

      // Default sort based on string comparison
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : bValue > aValue
        ? 1
        : -1;
    });

    setSortedData(sorted);
  }, [filteredData, orderBy, order, columns]);

  useEffect(() => {
    applyFilters();
  }, [data]);

  useEffect(() => {
    onDisplayedDataChange?.(filteredData);
  }, [filteredData]);

  const hasFilters = columns.some(column => column.filterConfig);

  return (
    <>
      {hasFilters && (
        <DSTableFilters
          filters={columnFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
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
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align="center">
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
            {sortedData.length > 0 ? (
              sortedData.map((rowData, index) => (
                <TableRow
                  key={rowData.id || index}
                  sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align="center">
                      {column.render(rowData)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DSTable;
