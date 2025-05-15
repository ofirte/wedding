import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import { useCreateBudgetItem } from "../../hooks/budget/useCreateBudgetItem";
import { useUpdateBudgetItem } from "../../hooks/budget/useUpdateBudgetItem";
import { useDeleteBudgetItem } from "../../hooks/budget/useDeleteBudgetItem";
import BudgetSummary from "./BudgetSummary";
import BudgetTable from "./BudgetTable";
import BudgetItemDialog from "./BudgetItemDialog";
import TotalBudgetEditor from "./TotalBudgetEditor";
import { useUpdateTotalBudget } from "../../hooks/budget/useUpdateTotalBudget";

export type BudgetItem = {
  id: string;
  name: string;
  group: string;
  expectedPrice: number;
  actualPrice: number;
  downPayment: number;
  contractsUrls?: string[];
};

const BudgetPlanner = () => {
  const theme = useTheme();

  const budgetGroups = [
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

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    group: "",
    expectedPrice: 0,
    actualPrice: 0,
    downPayment: 0,
    contractsUrls: [] as string[],
  });

  // Fetch budget items using TanStack Query
  const { data: budgetItems, isLoading, isError } = useBudgetItems();

  const { data: totalBudget, isLoading: isTotalBudgetLoading } =
    useTotalBudget();
  const { mutate: updateTotalBudget } = useUpdateTotalBudget();

  // Budget mutations for create, update, and delete operations with loading states
  const { mutate: createBudgetItem, isPending: isCreating } =
    useCreateBudgetItem();
  const { mutate: updateBudgetItem, isPending: isUpdating } =
    useUpdateBudgetItem();
  const { mutate: deleteBudgetItem, isPending: isDeleting } =
    useDeleteBudgetItem();

  // Combined loading state for any mutation in progress
  const isMutating = isCreating || isUpdating || isDeleting;

  // Open dialog for adding a new item
  const handleAddNew = () => {
    setEditingItem(null);
    setNewItem({
      name: "",
      group: "",
      expectedPrice: 0,
      actualPrice: 0,
      downPayment: 0,
      contractsUrls: [],
    });
    setOpen(true);
  };

  // Open dialog for editing an existing item
  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      group: item.group,
      expectedPrice: item.expectedPrice,
      actualPrice: item.actualPrice,
      downPayment: item.downPayment,
      contractsUrls: item.contractsUrls || [],
    });
    setOpen(true);
  };

  // Handle input changes in the dialog form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // Handle text fields
    if (name === "name" || name === "group") {
      setNewItem({
        ...newItem,
        [name]: value,
      });
    } else {
      // Handle numeric fields
      setNewItem({
        ...newItem,
        [name]: Number(value),
      });
    }
  };

  // Save the new or edited item
  const handleSave = () => {
    if (editingItem) {
      // Update existing item using the hook
      updateBudgetItem({
        id: editingItem.id,
        data: {
          name: newItem.name,
          group: newItem.group,
          expectedPrice: newItem.expectedPrice,
          actualPrice: newItem.actualPrice,
          downPayment: newItem.downPayment,
          contractsUrls: newItem.contractsUrls,
        },
      });
      setOpen(false);
    } else {
      // Add new item using the hook
      createBudgetItem({
        name: newItem.name,
        group: newItem.group,
        expectedPrice: newItem.expectedPrice,
        actualPrice: newItem.actualPrice,
        downPayment: newItem.downPayment,
        contractsUrls: newItem.contractsUrls,
      });
      setOpen(false);
    }
  };

  const totals = useMemo(() => {
    const calculateTotals = () => {
      if (!budgetItems || budgetItems.length === 0) {
        return { expected: 0, actual: 0, downPayment: 0, remaining: 0 };
      }

      return budgetItems.reduce(
        (acc, item) => {
          acc.expected += item.expectedPrice || 0;
          acc.actual += item.actualPrice || 0;
          acc.downPayment += item.downPayment || 0;
          acc.remaining += (item.actualPrice || 0) - (item.downPayment || 0);
          return acc;
        },
        { expected: 0, actual: 0, downPayment: 0, remaining: 0 }
      );
    };
    return calculateTotals();
  }, [budgetItems]);

  // Render loading, error, or content
  return (
    <Box sx={{ padding: 4 }}>
      {" "}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          backgroundColor: "#fafafa",
          borderRadius: 2,
          borderTop: `8px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            textAlign: "center",
            color: theme.palette.primary.contrastText,
            marginBottom: 3,
          }}
        >
          Wedding Budget Planner
        </Typography>

        <TotalBudgetEditor
          totalBudget={totalBudget?.amount ?? 0}
          isLoading={isTotalBudgetLoading}
          onSaveTotalBudget={updateTotalBudget}
        />

        <BudgetSummary totals={totals} totalBudget={totalBudget?.amount ?? 0} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          disabled={isMutating}
          sx={{
            marginBottom: 3,
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.info.dark,
            },
          }}
        >
          {isCreating ? "Adding..." : "Add Budget Item"}
        </Button>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">
            Error loading budget data. Please try again.
          </Typography>
        ) : (
          <BudgetTable
            items={budgetItems || []}
            onEdit={handleEdit}
            onDelete={deleteBudgetItem}
          />
        )}
      </Paper>
      <BudgetItemDialog
        open={open}
        onClose={() => setOpen(false)}
        editingItem={editingItem}
        newItem={newItem}
        budgetGroups={budgetGroups}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onFileAdded={(url: string) => {
          setNewItem((prev) => ({
            ...prev,
            contractsUrls: [...prev.contractsUrls, url],
          }));
        }}
        onFileDeleted={(url: string) => {
          setNewItem((prev) => ({
            ...prev,
            contractsUrls: prev.contractsUrls.filter((u) => u !== url),
          }));
        }}
      />
    </Box>
  );
};

export default BudgetPlanner;
