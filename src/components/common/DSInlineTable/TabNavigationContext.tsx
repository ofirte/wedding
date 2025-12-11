import React, { createContext, useContext, useCallback, useRef, useMemo, useImperativeHandle, forwardRef } from "react";
import { InlineColumn } from "./types";

interface CellRef {
  focus: () => void;
}

interface TabNavigationContextValue {
  registerCell: (rowId: string | number, columnId: string, ref: CellRef) => void;
  unregisterCell: (rowId: string | number, columnId: string) => void;
  focusNextCell: (rowId: string | number, currentColumnId: string) => void;
  focusPrevCell: (rowId: string | number, currentColumnId: string) => void;
  focusFirstCellInRow: (rowId: string | number) => void;
}

export interface TabNavigationRef {
  focusFirstCellInRow: (rowId: string | number) => void;
}

const TabNavigationContext = createContext<TabNavigationContextValue | null>(null);

interface TabNavigationProviderProps<T extends { id: string | number }> {
  columns: InlineColumn<T>[];
  children: React.ReactNode;
}

const TabNavigationProviderInner = <T extends { id: string | number }>(
  { columns, children }: TabNavigationProviderProps<T>,
  ref: React.Ref<TabNavigationRef>
) => {
  // Map of "rowId-columnId" -> CellRef
  const cellRefsMap = useRef<Map<string, CellRef>>(new Map());

  // Get ordered list of editable column IDs
  const editableColumnIds = useMemo(() => {
    return columns.filter((col) => col.editable).map((col) => col.id);
  }, [columns]);

  const getCellKey = (rowId: string | number, columnId: string) =>
    `${rowId}-${columnId}`;

  const registerCell = useCallback(
    (rowId: string | number, columnId: string, ref: CellRef) => {
      cellRefsMap.current.set(getCellKey(rowId, columnId), ref);
    },
    []
  );

  const unregisterCell = useCallback(
    (rowId: string | number, columnId: string) => {
      cellRefsMap.current.delete(getCellKey(rowId, columnId));
    },
    []
  );

  // Focus next cell in same row only - no setTimeout needed since we await the update
  const focusNextCell = useCallback(
    (rowId: string | number, currentColumnId: string) => {
      const currentColIndex = editableColumnIds.indexOf(currentColumnId);
      if (currentColIndex === -1) return;

      const nextColIndex = currentColIndex + 1;
      if (nextColIndex < editableColumnIds.length) {
        const nextColumnId = editableColumnIds[nextColIndex];
        cellRefsMap.current.get(getCellKey(rowId, nextColumnId))?.focus();
      }
      // Last cell in row → do nothing (per user request)
    },
    [editableColumnIds]
  );

  // Focus previous cell in same row only - no setTimeout needed since we await the update
  const focusPrevCell = useCallback(
    (rowId: string | number, currentColumnId: string) => {
      const currentColIndex = editableColumnIds.indexOf(currentColumnId);
      if (currentColIndex === -1) return;

      const prevColIndex = currentColIndex - 1;
      if (prevColIndex >= 0) {
        const prevColumnId = editableColumnIds[prevColIndex];
        cellRefsMap.current.get(getCellKey(rowId, prevColumnId))?.focus();
      }
      // First cell in row → do nothing
    },
    [editableColumnIds]
  );

  // Focus first cell in a row - used after adding new row
  // Uses retry mechanism since new row may not be rendered/registered yet
  const focusFirstCellInRow = useCallback(
    (rowId: string | number) => {
      if (editableColumnIds.length === 0) return;

      const firstColumnId = editableColumnIds[0];
      const cellKey = getCellKey(rowId, firstColumnId);
      let attempts = 0;
      const maxAttempts = 20; // Try for up to 1 second (20 * 50ms)

      const tryFocus = () => {
        const cellRef = cellRefsMap.current.get(cellKey);
        if (cellRef) {
          cellRef.focus();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryFocus, 50);
        }
      };

      // Start trying immediately, then retry every 50ms if not found
      tryFocus();
    },
    [editableColumnIds]
  );

  // Expose focusFirstCellInRow via ref for parent component access
  useImperativeHandle(ref, () => ({
    focusFirstCellInRow,
  }), [focusFirstCellInRow]);

  const value = useMemo(
    () => ({
      registerCell,
      unregisterCell,
      focusNextCell,
      focusPrevCell,
      focusFirstCellInRow,
    }),
    [registerCell, unregisterCell, focusNextCell, focusPrevCell, focusFirstCellInRow]
  );

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
};

// Export with forwardRef
export const TabNavigationProvider = forwardRef(TabNavigationProviderInner) as <T extends { id: string | number }>(
  props: TabNavigationProviderProps<T> & { ref?: React.Ref<TabNavigationRef> }
) => React.ReactElement;

export const useTabNavigation = () => {
  const context = useContext(TabNavigationContext);
  if (!context) {
    throw new Error("useTabNavigation must be used within TabNavigationProvider");
  }
  return context;
};

// Optional hook that returns null if outside provider (for flexibility)
export const useTabNavigationOptional = () => {
  return useContext(TabNavigationContext);
};
