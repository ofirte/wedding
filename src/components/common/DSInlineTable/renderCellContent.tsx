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

  // Check conditional editability per row (if defined), otherwise fall back to column.editable
  const isEditable = column.isEditable ? column.isEditable(row) : column.editable;

  // Non-editable column with custom render
  if (!isEditable) {
    return column.render ? column.render(row) : String(rawValue ?? "");
  }

  // Select type - support dynamic options per row
  if (column.editType === "select") {
    const options = column.getEditOptions ? column.getEditOptions(row) : column.editOptions;
    if (options && options.length > 0) {
      return (
        <MemoizedSelectCell
          rowId={row.id}
          columnId={column.id}
          value={rawValue || ""}
          options={options}
          colorMap={column.editColorMap}
          onCellUpdate={onCellUpdate}
        />
      );
    }
    // No options available, render as non-editable
    return column.render ? column.render(row) : String(rawValue ?? "");
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
