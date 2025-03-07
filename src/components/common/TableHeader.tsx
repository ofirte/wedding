import React from "react";
import { TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { Column } from "./DSTable";

interface TableHeaderProps<T extends { id: string | number; }> {
  columns: Column<T>[];
  orderBy: string;
  order: "asc" | "desc";
  onRequestSort: (columnId: string) => void;
}

/**
 * TableHeader component - handles column headers and sorting
 */
const TableHeader = <T extends { id: string | number; },>({ 
  columns, 
  orderBy, 
  order, 
  onRequestSort 
}: TableHeaderProps<T>) => {
  const createSortHandler = (columnId: string) => () => {
    onRequestSort(columnId);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.id} align="center">
            {column.sortable ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : "asc"}
                onClick={createSortHandler(column.id)}
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
  );
};

export default TableHeader;