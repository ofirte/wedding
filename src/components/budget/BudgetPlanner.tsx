import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import BudgetSummary from "./BudgetSummary";
import BudgetTable from "./BudgetTable";
import BudgetItemDialog from "./BudgetItemDialog";
import TotalBudgetEditor from "./TotalBudgetEditor";

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
  // Access theme
  const theme = useTheme();

  // Example budget groups
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

  // State
  const [items, setItems] = useState<BudgetItem[]>([]);
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

  // Fetch total budget using the new hook
  const {
    totalBudget,
    setTotalBudget,
    isLoading: isTotalBudgetLoading,
  } = useTotalBudget();

  // Update state when data changes
  React.useEffect(() => {
    if (budgetItems) {
      setItems(budgetItems);
    }
  }, [budgetItems]);

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
  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const itemRef = doc(db, "budget", editingItem.id);
        await updateDoc(itemRef, {
          name: newItem.name,
          group: newItem.group,
          expectedPrice: newItem.expectedPrice,
          actualPrice: newItem.actualPrice,
          downPayment: newItem.downPayment,
          contractsUrls: newItem.contractsUrls,
        });
      } else {
        // Add new item
        await addDoc(collection(db, "budget"), {
          name: newItem.name,
          group: newItem.group,
          expectedPrice: newItem.expectedPrice,
          actualPrice: newItem.actualPrice,
          downPayment: newItem.downPayment,
          contractsUrls: newItem.contractsUrls,
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving budget item: ", error);
    }
  };

  // Delete an item
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "budget", id));
    } catch (error) {
      console.error("Error deleting budget item: ", error);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        acc.expected += item.expectedPrice;
        acc.actual += item.actualPrice;
        acc.downPayment += item.downPayment;
        acc.remaining += item.actualPrice - item.downPayment;
        return acc;
      },
      { expected: 0, actual: 0, downPayment: 0, remaining: 0 }
    );
  };

  // Handle saving total budget
  const handleSaveTotalBudget = (newBudget: number) => {
    setTotalBudget(newBudget);
  };

  const totals = calculateTotals();

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
          totalBudget={totalBudget}
          isLoading={isTotalBudgetLoading}
          onSaveTotalBudget={handleSaveTotalBudget}
        />
        <BudgetSummary totals={totals} totalBudget={totalBudget} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            marginBottom: 3,
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.info.dark,
            },
          }}
        >
          Add Budget Item
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
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
