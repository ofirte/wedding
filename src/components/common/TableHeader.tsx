import React from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
} from "@mui/material";
import { Column } from "./DSTable";

interface TableHeaderProps<T extends { id: string | number }> {
  columns: Column<T>[];
  orderBy: string;
  order: "asc" | "desc";
  onRequestSort: (columnId: string) => void;
  showSelectColumn?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (isSelected: boolean) => void;
}

/**
 * TableHeader component - handles column headers and sorting
 */
const TableHeader = <T extends { id: string | number }>({
  columns,
  orderBy,
  order,
  onRequestSort,
  showSelectColumn = false,
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
}: TableHeaderProps<T>) => {
  const createSortHandler = (columnId: string) => () => {
    onRequestSort(columnId);
  };

  const handleSelectAllChange = (_: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(!(isAllSelected || isIndeterminate));
  };

  return (
    <TableHead>
      <TableRow>
        {showSelectColumn && (
          <TableCell align="center" sx={{ width: "48px", minWidth: "48px" }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAllChange}
              color="primary"
            />
          </TableCell>
        )}
        {columns
          .filter((column) => !column.hidden)
          .map((column) => (
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
