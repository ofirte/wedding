import React from "react";
import { BudgetItem } from "./BudgetPlanner";
import { Column } from "../common/DSTable";
import { Chip, IconButton, Button, Box } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../../utils/NumberUtils";

// Component for the actions cell
type BudgetActionCellProps = {
  item: BudgetItem;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
};

const BudgetActionCell: React.FC<BudgetActionCellProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <IconButton size="small" color="primary" onClick={() => onEdit(item)}>
        <EditIcon />
      </IconButton>
      <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
        <DeleteIcon />
      </IconButton>
    </>
  );
};

// Get color for category chip
const getCategoryColor = (group: string) => {
  const colors: Record<string, string> = {
    Venue: "#e1bee7",
    Catering: "#bbdefb",
    Attire: "#c8e6c9",
    Photography: "#ffccbc",
    Music: "#d1c4e9",
    Decor: "#b2ebf2",
    Flowers: "#f8bbd0",
    Transportation: "#ffe0b2",
    Stationery: "#c5cae9",
    Gifts: "#b3e5fc",
    Beauty: "#f0f4c3",
  };

  return colors[group] || "#e0e0e0";
};

export const createBudgetColumns = (
  onEdit: (item: BudgetItem) => void,
  onDelete: (id: string) => void
): Column<BudgetItem>[] => [
  {
    id: "name",
    label: "Expense Name",
    sortable: true,
    render: (item: BudgetItem) => item.name,
  },
  {
    id: "group",
    label: "Category",
    sortable: true,
    render: (item: BudgetItem) => (
      <Chip
        label={item.group}
        size="small"
        sx={{
          backgroundColor: getCategoryColor(item.group),
        }}
      />
    ),
    filterConfig: {
      id: "group",
      label: "Category",
      type: "multiple",
      options: (data: BudgetItem[]) => {
        const uniqueGroups = Array.from(
          new Set(data.map((item) => item.group))
        ).filter(Boolean);

        return uniqueGroups.map((group) => ({
          value: group,
          label: group,
        }));
      },
    },
  },
  {
    id: "expectedPrice",
    label: "Expected Price",
    sortable: true,
    render: (item: BudgetItem) =>
      formatCurrency({
        value: item.expectedPrice,
        sign: "₪",
      }),
  },
  {
    id: "actualPrice",
    label: "Actual Price",
    sortable: true,
    render: (item: BudgetItem) =>
      formatCurrency({
        value: item.actualPrice,
        sign: "₪",
      }),
  },
  {
    id: "downPayment",
    label: "Down Payment",
    sortable: true,
    render: (item: BudgetItem) =>
      formatCurrency({
        value: item.downPayment,
        sign: "₪",
      }),
  },
  {
    id: "balance",
    label: "Balance",
    sortable: true,
    render: (item: BudgetItem) =>
      formatCurrency({
        value: item.actualPrice - item.downPayment,
        sign: "₪",
      }),
  },
  {
    id: "contract",
    label: "Contract",
    sortable: false,
    render: (item: BudgetItem) => {
      const itemsIcons =
        item?.contractsUrls?.map((url, index) => (
          <IconButton
            key={index}
            size="small"
            color="primary"
            href={url}
            target="_blank"
          >
            <PictureAsPdfIcon />
          </IconButton>
        )) ?? [];
      return <Box>{itemsIcons?.length > 0 ? itemsIcons : "-"}</Box>;
    },
  },

  {
    id: "actions",
    label: "Actions",
    sortable: false,
    render: (item: BudgetItem) => (
      <BudgetActionCell item={item} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
