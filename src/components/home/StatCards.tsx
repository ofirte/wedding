import React from "react";
import { Grid2 as Grid } from "@mui/material";
import StatCard from "./StatCard";
import { useNavigate } from "react-router";
import {
  PeopleAlt as GuestsIcon,
  Money as BudgetIcon,
  CheckCircleOutline as TaskIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import useTasks from "../../hooks/tasks/useTasks";
// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return "₪" + amount.toLocaleString();
};

interface StatCardsProps {
  daysRemaining: number;
}

const StatCards: React.FC<StatCardsProps> = ({ daysRemaining }) => {
  const navigate = useNavigate();
  const { data: guests } = useInvitees();
  const { data: budget } = useBudgetItems();
  const { data: totalBudget } = useTotalBudget();
  const { data: tasks } = useTasks();
  const totalBudgetAmount = totalBudget?.amount || 0;
  const guestStats = {
    total:
      guests?.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0) || 0,
    confirmed:
      guests?.filter((guest) => guest.rsvp === "confirmed").length || 0,
    pending: guests?.filter((guest) => guest.rsvp === "pending").length || 0,
    declined: guests?.filter((guest) => guest.rsvp === "declined").length || 0,
  };

  const totalSpent =
    budget?.reduce((acc, i) => acc + parseInt(i.actualPrice.toString()), 0) ||
    0;
  const remainingBudget = totalBudgetAmount
    ? totalBudgetAmount - totalSpent
    : 0;
  const budgetStats = {
    total: totalBudgetAmount,
    spent: totalSpent,
    remaining: remainingBudget,
  };

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task) => task.completed).length || 0;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskStats = {
    total: totalTasks,
    completed: completedTasks,
    percentage: percentage,
  };
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 4, md: 3 }}>
        <StatCard
          icon={<GuestsIcon />}
          title="Guest List"
          value={`${guestStats.confirmed}/${guestStats.total}`}
          subtitle="Guests confirmed"
          color="primary"
          onClick={() => navigate("/invite")}
        />
      </Grid>

      <Grid size={{ xs: 4, md: 3 }}>
        <StatCard
          icon={<BudgetIcon />}
          title="Budget"
          value={formatCurrency(budgetStats.spent)}
          subtitle={`of ${formatCurrency(budgetStats.total)}`}
          color="info"
          onClick={() => navigate("/budget")}
        />
      </Grid>

      <Grid size={{ xs: 4, md: 3 }}>
        <StatCard
          icon={<TaskIcon />}
          title="Tasks"
          value={`${taskStats.completed}/${taskStats.total}`}
          subtitle={`${taskStats.percentage}% completed`}
          color="success"
          onClick={() => navigate("/tasks")}
        />
      </Grid>

      <Grid size={{ xs: 4, md: 3 }}>
        <StatCard
          icon={<TimeIcon />}
          title="Timeline"
          value={daysRemaining}
          subtitle="Days remaining"
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

export default StatCards;
