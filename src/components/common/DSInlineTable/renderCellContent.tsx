import React from "react";
import { InlineColumn } from "./types";
import { MemoizedEditableCell, MemoizedSelectCell, MemoizedAutocompleteCell } from "./cells";

// Helper to render cell content - defined outside component to avoid recreation
export const renderCellContent = <T extends { id: string | number }>(
  column: InlineColumn<T>,
  row: T,
  onCellUpdate: (rowId: string | number, columnId: string, value: any) => void
) => {
  const rawValue = column.getValue ? column.getValue(row) : (row as any)[column.id];

  // Non-editable column with custom render
  if (!column.editable) {
    return column.render ? column.render(row) : String(rawValue ?? "");
  }

  // Select type
  if (column.editType === "select" && column.editOptions) {
    return (
      <MemoizedSelectCell
        rowId={row.id}
        columnId={column.id}
        value={rawValue || ""}
        options={column.editOptions}
        colorMap={column.editColorMap}
        onCellUpdate={onCellUpdate}
      />
    );
  }

  // Autocomplete type - dropdown with existing values + free text
  if (column.editType === "autocomplete") {
    return (
      <MemoizedAutocompleteCell
        rowId={row.id}
        columnId={column.id}
        value={rawValue || ""}
        options={column.autocompleteOptions || []}
        onCellUpdate={onCellUpdate}
      />
    );
  }

  // Text/Number/Date types
  const editableType = (column.editType || "text") as "text" | "number" | "date";

  return (
    <MemoizedEditableCell
      rowId={row.id}
      columnId={column.id}
      value={rawValue}
      type={editableType}
      onCellUpdate={onCellUpdate}
    />
  );
};
