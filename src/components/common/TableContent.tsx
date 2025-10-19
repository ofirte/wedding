import React from "react";
import { TableCell, TableRow, Checkbox } from "@mui/material";
import { Column } from "./DSTable";

interface TableContentProps<T> {
  columns: Column<T>[];
  data: T[];
}

/**
 * TableContent component - renders table rows based on provided data
 */
interface TableContentProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  showSelectColumn?: boolean;
  selectedRows?: T[];
  onRowSelect?: (row: T, isSelected: boolean) => void;
  onRowClick?: (row: T) => void;
}

const TableContent = <T extends { id: string | number }>({
  columns,
  data,
  showSelectColumn = false,
  selectedRows = [],
  onRowSelect,
  onRowClick,
}: TableContentProps<T>) => {
  if (data.length === 0) {
    const colSpan = columns.length + (showSelectColumn ? 1 : 0);
    return (
      <TableRow>
        <TableCell colSpan={colSpan} align="center">
          No data available
        </TableCell>
      </TableRow>
    );
  }

  const handleRowSelectChange =
    (row: T) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onRowSelect?.(row, event.target.checked);
    };

  const isRowSelected = (row: T) => {
    return selectedRows.some((selectedRow) => selectedRow.id === row.id);
  };

  return (
    <>
      {data.map((rowData, index) => (
        <TableRow
          key={`${rowData.id}-${index}`}
          sx={{
            "&:hover": { bgcolor: "#f5f5f5" },
            cursor: onRowClick ? "pointer" : "default",
          }}
          onClick={onRowClick ? () => onRowClick(rowData) : undefined}
        >
          {showSelectColumn && (
            <TableCell align="center" sx={{ width: "48px", minWidth: "48px" }}>
              <Checkbox
                checked={isRowSelected(rowData)}
                onChange={handleRowSelectChange(rowData)}
                color="primary"
              />
            </TableCell>
          )}
          {columns.map((column) => (
            <TableCell key={column.id} align="center">
              {column.render(rowData)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableContent;
