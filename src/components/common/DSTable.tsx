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
};

type Order = "asc" | "desc";

const DSTable: FC<DSTableProps<any>> = ({ columns, data }) => {
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [sortedData, setSortedData] = useState<any[]>(data);

  // Handle sorting
  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  // Apply sorting using the provided sortFn if available
  useEffect(() => {
    if (!orderBy) {
      setSortedData(data);
      return;
    }

    const column = columns.find((col) => col.id === orderBy);
    if (!column || !column.sortable) {
      setSortedData(data);
      return;
    }

    const sorted = [...data].sort((a, b) => {
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
  }, [data, orderBy, order, columns]);

  return (
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
  );
};

export default DSTable;
