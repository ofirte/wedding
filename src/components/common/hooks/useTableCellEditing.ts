import { useState, useEffect, useRef, useCallback } from "react";

export interface EditingCell<T> {
  rowId: string | number;
  field: keyof T;
}

export interface TypeConverter<T> {
  field: keyof T;
  convert: (value: string) => any;
}

export interface UseTableCellEditingOptions<T extends { id: string | number }> {
  excludeFields?: (keyof T)[];
  typeConverters?: TypeConverter<T>[];
  onUpdate: (id: string | number, field: keyof T, value: any, row: T) => void;
}

export const useTableCellEditing = <T extends { id: string | number }>(
  options: UseTableCellEditingOptions<T>
) => {
  const { excludeFields = [], typeConverters = [], onUpdate } = options;

  const [editingCell, setEditingCell] = useState<EditingCell<T> | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = useCallback(
    (row: T, field: keyof T) => {
      if (excludeFields.includes(field)) return;
      setEditingCell({ rowId: row.id, field });
      setEditValue(String((row as any)[field] ?? ""));
    },
    [excludeFields]
  );

  const handleCellBlur = useCallback(
    (row: T, field: keyof T) => {
      const originalValue = String((row as any)[field] ?? "");
      if (editValue !== originalValue) {
        // Apply type converter if exists
        const converter = typeConverters.find((c) => c.field === field);
        const convertedValue = converter ? converter.convert(editValue) : editValue;
        onUpdate(row.id, field, convertedValue, row);
      }
      setEditingCell(null);
    },
    [editValue, typeConverters, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: T, field: keyof T) => {
      if (e.key === "Enter") {
        handleCellBlur(row, field);
      } else if (e.key === "Escape") {
        setEditingCell(null);
      }
    },
    [handleCellBlur]
  );

  const isEditing = useCallback(
    (rowId: string | number, field: keyof T): boolean => {
      return editingCell?.rowId === rowId && editingCell?.field === field;
    },
    [editingCell]
  );

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  return {
    editingCell,
    editValue,
    inputRef,
    setEditValue,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
    isEditing,
    cancelEdit,
  };
};
