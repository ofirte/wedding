import React from "react";
import { TableCell, TableRow, Checkbox } from "@mui/material";
import { Column, VariantConfig } from "./DSTable";

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
  variantConfig: VariantConfig;
}

const TableContent = <T extends { id: string | number }>({
  columns,
  data,
  showSelectColumn = false,
  selectedRows = [],
  onRowSelect,
  onRowClick,
  variantConfig,
}: TableContentProps<T>) => {
  if (data.length === 0) {
    const visibleColumnsCount = columns.filter(
      (column) => !column.hidden
    ).length;
    const colSpan = visibleColumnsCount + (showSelectColumn ? 1 : 0);
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
            <TableCell
              align="center"
              sx={{
                width: "48px",
                minWidth: "48px",
                py: variantConfig.cellPy,
              }}
            >
              <Checkbox
                checked={isRowSelected(rowData)}
                onChange={handleRowSelectChange(rowData)}
                color="primary"
              />
            </TableCell>
          )}
          {columns
            .filter((column) => !column.hidden)
            .map((column) => (
              <TableCell
                key={column.id}
                align="center"
                sx={{
                  py: variantConfig.cellPy,
                  ...(column.minWidth && { minWidth: column.minWidth }),
                  ...(column.width && { width: column.width }),
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
                {column.render(rowData)}
              </TableCell>
            ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableContent;
