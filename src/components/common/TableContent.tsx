import React from "react";
import { TableCell, TableRow } from "@mui/material";
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
}

const TableContent = <T extends { id: string | number }>({
  columns,
  data,
}: TableContentProps<T>) => {
  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center">
          No data available
        </TableCell>
      </TableRow>
    );
  }
  return (
    <>
      {data.map((rowData) => (
        <TableRow key={rowData.id} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
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
