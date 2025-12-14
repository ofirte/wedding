import { useCallback, useMemo, useRef } from "react";

export const useTableSelection = <T extends { id: string | number }>(
  data: T[],
  selectedRows: T[],
  onSelectionChange?: (selectedRows: T[]) => void
) => {
  // Stable refs for callbacks
  const dataRef = useRef(data);
  dataRef.current = data;
  const selectedRowsRef = useRef(selectedRows);
  selectedRowsRef.current = selectedRows;
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // Create a Set for O(1) selection lookup
  const selectedIdSet = useMemo(
    () => new Set(selectedRows.map((r) => r.id)),
    [selectedRows]
  );

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleRowSelect = useCallback((row: T, checked: boolean) => {
    if (!onSelectionChangeRef.current) return;
    if (checked) {
      onSelectionChangeRef.current([...selectedRowsRef.current, row]);
    } else {
      onSelectionChangeRef.current(
        selectedRowsRef.current.filter((r) => r.id !== row.id)
      );
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChangeRef.current) return;
    if (checked) {
      onSelectionChangeRef.current([...dataRef.current]);
    } else {
      onSelectionChangeRef.current([]);
    }
  }, []);

  return {
    selectedIdSet,
    allSelected,
    someSelected,
    handleRowSelect,
    handleSelectAll,
  };
};
