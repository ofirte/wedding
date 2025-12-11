import React, { useMemo, useCallback } from "react";
import { BudgetItem } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import DSInlineTable from "../common/DSInlineTable";
import { createBudgetInlineColumns } from "./BudgetInlineColumns";

interface BudgetTableProps {
  items: BudgetItem[];
  onCellUpdate: (rowId: string | number, field: string, value: any, row: BudgetItem) => void;
  onDelete: (id: string) => void;
  onAddRow: (newRow: Omit<BudgetItem, "id">, onSuccess?: (newRowId: string | number) => void) => void;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  onCellUpdate,
  onDelete,
  onAddRow,
}) => {
  const { t } = useTranslation();

  // Handle contract changes
  const handleContractChange = useCallback(
    (itemId: string, contracts: string[]) => {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        onCellUpdate(itemId, "contractsUrls", contracts, item);
      }
    },
    [items, onCellUpdate]
  );

  // Column definitions
  const columns = useMemo(
    () => createBudgetInlineColumns(onDelete, handleContractChange, t),
    [onDelete, handleContractChange, t]
  );

  // Default values for new budget items
  const defaultNewRow = useMemo(
    () => ({
      group: "Other",
      expectedPrice: 0,
      actualPrice: 0,
      downPayment: 0,
      contractsUrls: [],
    }),
    []
  );

  return (
    <DSInlineTable
      columns={columns}
      data={items}
      onCellUpdate={onCellUpdate}
      showSearch
      searchFields={["name"]}
      defaultSortField="createdAt"

      enableInlineAdd
      addRowPlaceholder={t("budget.addNewItem")}
      addRowField="name"
      defaultNewRow={defaultNewRow}
      onAddRow={onAddRow}
      emptyMessage={t("budget.noExpenses")}
      mobileCardTitle={(row) => row.name}
    />
  );
};

export default BudgetTable;
