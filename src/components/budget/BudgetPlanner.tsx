// BudgetPlanner.tsx - Main Container Component
import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BudgetSummary from "./BudgetSummary";
import BudgetTable from "./BudgetTable";
import BudgetItemDialog from "./BudgetItemDialog";

export type BudgetItem = {
  id: number;
  name: string;
  group: string;
  expectedPrice: number;
  actualPrice: number;
  downPayment: number;
};

const BudgetPlanner = () => {
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

  // Initial state
  const [items, setItems] = useState<BudgetItem[]>([
    {
      id: 1,
      name: "Venue Rental",
      group: "Venue",
      expectedPrice: 5000,
      actualPrice: 5200,
      downPayment: 2000,
    },
    {
      id: 2,
      name: "Catering (per person)",
      group: "Catering",
      expectedPrice: 75,
      actualPrice: 80,
      downPayment: 1000,
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    group: "",
    expectedPrice: 0,
    actualPrice: 0,
    downPayment: 0,
  });

  // Open dialog for adding a new item
  const handleAddNew = () => {
    setEditingItem(null);
    setNewItem({
      name: "",
      group: "",
      expectedPrice: 0,
      actualPrice: 0,
      downPayment: 0,
    });
    setOpen(true);
  };

  // Open dialog for editing an existing item
  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setOpen(true);
  };

  // Handle input changes in the dialog form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === "name" || name === "group" ? value : Number(value),
    });
  };

  // Save the new or edited item
  const handleSave = () => {
    if (editingItem) {
      // Update existing item
      setItems(
        items.map((item) =>
          item.id === editingItem.id ? { ...newItem, id: item.id } : item
        )
      );
    } else {
      // Add new item
      setItems([...items, { ...newItem, id: Date.now() }]);
    }
    setOpen(false);
  };

  // Delete an item
  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
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

  const totals = calculateTotals();

  return (
    <Box sx={{ padding: 4 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          backgroundColor: "#fafafa",
          borderRadius: 2,
          borderTop: "8px solid #9c88ff",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            textAlign: "center",
            color: "#424242",
            marginBottom: 3,
          }}
        >
          Wedding Budget Planner
        </Typography>

        <BudgetSummary totals={totals} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            marginBottom: 3,
            backgroundColor: "#9c88ff",
            "&:hover": {
              backgroundColor: "#8c78ef",
            },
          }}
        >
          Add Budget Item
        </Button>

        <BudgetTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Paper>
      <BudgetItemDialog
        open={open}
        onClose={() => setOpen(false)}
        editingItem={editingItem}
        newItem={newItem}
        budgetGroups={budgetGroups}
        onInputChange={handleInputChange}
        onSave={handleSave}
      />
    </Box>
  );
};

export default BudgetPlanner;
