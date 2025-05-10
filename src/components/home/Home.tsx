import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid2 as Grid,
  Button,
  Divider,
  useTheme,
  Stack,
  LinearProgress,
  styled,
} from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import useTasks from "../../hooks/tasks/useTasks";

// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

// Mock wedding date - you can replace with real data later
const weddingDate = new Date("2025-09-19");

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Calculate days remaining for the Timeline card
  const calculateDaysRemaining = (): number => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysRemaining = calculateDaysRemaining();
  const { data: guests, isLoading: guestsLoading } = useInvitees();
  const { data: budget, isLoading: budgetLoading } = useBudgetItems();
  const { tasks } = useTasks();
  const guestStats = {
    total:
      guests?.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0) || 0,
    confirmed:
      guests?.filter((guest) => guest.rsvp === "confirmed").length || 0,
    pending: guests?.filter((guest) => guest.rsvp === "pending").length || 0,
    declined: guests?.filter((guest) => guest.rsvp === "declined").length || 0,
  };
  const totalBudget =
    budget?.reduce((acc, i) => acc + parseInt(i.expectedPrice.toString()), 0) ||
    0;
  const totalSpent =
    budget?.reduce((acc, i) => acc + parseInt(i.downPayment.toString()), 0) ||
    0;
  const remainingBudget = totalBudget - totalSpent;
  const budgetStats = {
    total: totalBudget,
    spent: totalSpent,
    remaining: remainingBudget,
  };
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskStats = {
    total: totalTasks,
    completed: completedTasks,
    percentage: percentage,
  };

  // Format currency for budget display
  const formatCurrency = (amount: number): string => {
    return "₪" + amount.toLocaleString();
  };

  return (
    <Box sx={{ py: 4, px: 1 }}>
      <WeddingCountdownBanner weddingDate={weddingDate} />
      <StatCards
        guestStats={guestStats}
        budgetStats={budgetStats}
        taskStats={taskStats}
        daysRemaining={daysRemaining}
      />
      <DetailedOverviewCards
        budgetStats={budgetStats}
        guestStats={guestStats}
      />
    </Box>
  );
};

export default Home;
