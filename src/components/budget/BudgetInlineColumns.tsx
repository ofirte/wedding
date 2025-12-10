import React, { useState } from "react";
import { BudgetItem } from "@wedding-plan/types";
import { InlineColumn } from "../common/DSInlineTable";
import { IconButton, Box } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { formatCurrency } from "../../utils/NumberUtils";
import { DSSelectOption } from "../common/cells/DSSelectCell";
import ContractManageDialog from "./ContractManageDialog";

// Contract cell component with dialog state management
interface ContractCellProps {
  item: BudgetItem;
  onContractChange: (itemId: string, contracts: string[]) => void;
}

const ContractCell: React.FC<ContractCellProps> = ({ item, onContractChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const contracts = item.contractsUrls || [];

  const handleUpload = (url: string) => {
    onContractChange(item.id, [...contracts, url]);
  };

  const handleDelete = (url: string) => {
    onContractChange(item.id, contracts.filter((c) => c !== url));
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {contracts.slice(0, 2).map((url, index) => (
          <IconButton
            key={index}
            size="small"
            color="primary"
            href={url}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        ))}
        {contracts.length > 2 && (
          <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            +{contracts.length - 2}
          </Box>
        )}
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setDialogOpen(true);
          }}
          sx={{ ml: contracts.length > 0 ? 0.5 : 0 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <ContractManageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        contracts={contracts}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />
    </>
  );
};

// Budget groups for select options
export const BUDGET_GROUPS = [
  "Venue",
  "Catering",
  "Attire",
  "Photography",
  "Music",
  "Decor",
  "Flowers",
  "Transportation",
  "Stationery",
  "Gifts",
  "Beauty",
  "Other",
];

// Color map for budget groups
export const BUDGET_GROUP_COLORS: Record<string, string> = {
  Venue: "#9C27B0",
  Catering: "#2196F3",
  Attire: "#4CAF50",
  Photography: "#FF5722",
  Music: "#673AB7",
  Decor: "#00BCD4",
  Flowers: "#E91E63",
  Transportation: "#FF9800",
  Stationery: "#3F51B5",
  Gifts: "#03A9F4",
  Beauty: "#8BC34A",
  Other: "#9E9E9E",
};

// Create select options for budget groups with translations
export const createBudgetGroupOptions = (
  t: (key: string) => string
): DSSelectOption<string>[] =>
  BUDGET_GROUPS.map((group) => ({
    value: group,
    label: t(`budget.categories.${group.toLowerCase()}`),
    color: BUDGET_GROUP_COLORS[group],
  }));

export const createBudgetInlineColumns = (
  onDelete: (id: string) => void,
  onContractChange: (itemId: string, contracts: string[]) => void,
  t: (key: string) => string
): InlineColumn<BudgetItem>[] => [
  {
    id: "name",
    label: t("common.expenseName"),
    sticky: true,
    sortable: true,
    editable: true,
    editType: "text",
    minWidth: 150,
  },
  {
    id: "group",
    label: t("common.category"),
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: createBudgetGroupOptions(t),
    editColorMap: BUDGET_GROUP_COLORS,
    minWidth: 130,
  },
  {
    id: "expectedPrice",
    label: t("common.expectedPrice"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 120,
  },
  {
    id: "actualPrice",
    label: t("common.actualPrice"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 120,
  },
  {
    id: "downPayment",
    label: t("common.downPayment"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 120,
  },
  {
    id: "balance",
    label: t("common.balance"),
    sortable: true,
    editable: false,
    render: (item: BudgetItem) =>
      formatCurrency({
        value: item.actualPrice - item.downPayment,
        sign: "₪",
      }),
    minWidth: 100,
  },
  {
    id: "contract",
    label: t("common.contract"),
    sortable: false,
    editable: false,
    render: (item: BudgetItem) => (
      <ContractCell item={item} onContractChange={onContractChange} />
    ),
    minWidth: 100,
  },
  {
    id: "actions",
    label: t("common.actions"),
    sortable: false,
    editable: false,
    render: (item: BudgetItem) => (
      <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
        <DeleteIcon />
      </IconButton>
    ),
    width: 60,
  },
];
