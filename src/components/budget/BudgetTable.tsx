// BudgetTable.tsx
import React from "react";
import { Box } from "@mui/material";
import { BudgetItem } from "./BudgetPlanner";
import DSTable from "../common/DSTable";
import { createBudgetColumns } from "./BudgetListColumns";

type BudgetTableProps = {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
};

const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  const columns = createBudgetColumns(onEdit, onDelete);

  return (
    <Box sx={{ marginTop: 2 }}>
      <DSTable
        columns={columns}
        data={items}
        showExport={true}
        exportFilename="budget-data"
      />
    </Box>
  );
};

export default BudgetTable;
