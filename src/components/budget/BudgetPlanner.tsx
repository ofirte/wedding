// BudgetPlanner.tsx - Main Container Component
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import BudgetSummary from "./BudgetSummary";
import BudgetTable from "./BudgetTable";
import BudgetItemDialog from "./BudgetItemDialog";

export type BudgetItem = {
  id: string;
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
  });

  // Fetch budget items from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "budget"),
      (snapshot) => {
        const budgetItems = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            group: data.group,
            expectedPrice: data.expectedPrice,
            actualPrice: data.actualPrice,
            downPayment: data.downPayment,
          };
        });
        setItems(budgetItems);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.error("Error fetching budget items: ", error.message);
        } else {
          console.error("Error fetching budget items: ", error);
        }
      }
    );
    return () => unsubscribe();
  }, []);

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
    setNewItem({
      name: item.name,
      group: item.group,
      expectedPrice: item.expectedPrice,
      actualPrice: item.actualPrice,
      downPayment: item.downPayment,
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
    setNewItem({
      ...newItem,
      [name]: name === "name" || name === "group" ? value : Number(value),
    });
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
        });
      } else {
        // Add new item
        await addDoc(collection(db, "budget"), {
          name: newItem.name,
          group: newItem.group,
          expectedPrice: newItem.expectedPrice,
          actualPrice: newItem.actualPrice,
          downPayment: newItem.downPayment,
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
