import { memo, useCallback, useEffect, useRef } from "react";
import { DSSelectCell, DSSelectOption, DSSelectCellRef } from "../../cells/DSSelectCell";
import { useTabNavigationOptional } from "../TabNavigationContext";

interface MemoizedSelectCellProps {
  rowId: string | number;
  columnId: string;
  value: string;
  options: DSSelectOption<string>[];
  colorMap?: Record<string, string>;
  onCellUpdate: (rowId: string | number, columnId: string, value: any) => void | Promise<void>;
}

export const MemoizedSelectCell = memo(({
  rowId,
  columnId,
  value,
  options,
  colorMap,
  onCellUpdate
}: MemoizedSelectCellProps) => {
  const selectRef = useRef<DSSelectCellRef>(null);
  const tabNav = useTabNavigationOptional();

  // Register cell with tab navigation context
  useEffect(() => {
    if (tabNav) {
      tabNav.registerCell(rowId, columnId, {
        focus: () => selectRef.current?.focus(),
      });
      return () => tabNav.unregisterCell(rowId, columnId);
    }
  }, [tabNav, rowId, columnId]);

  const handleChange = useCallback((newValue: string) => {
    return onCellUpdate(rowId, columnId, newValue);
  }, [rowId, columnId, onCellUpdate]);

  const handleTabNext = useCallback(() => {
    tabNav?.focusNextCell(rowId, columnId);
  }, [tabNav, rowId, columnId]);

  const handleTabPrev = useCallback(() => {
    tabNav?.focusPrevCell(rowId, columnId);
  }, [tabNav, rowId, columnId]);

  return (
    <DSSelectCell
      ref={selectRef}
      value={value}
      options={options}
      colorMap={colorMap}
      onChange={handleChange}
      onTabNext={handleTabNext}
      onTabPrev={handleTabPrev}
    />
  );
});
