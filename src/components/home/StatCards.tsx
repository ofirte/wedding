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

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return "₪" + amount.toLocaleString();
};

interface StatCardsProps {
  guestStats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  budgetStats: {
    total: number;
    spent: number;
    remaining: number;
  };
  taskStats: {
    total: number;
    completed: number;
    percentage: number;
  };
  daysRemaining: number;
}

const StatCards: React.FC<StatCardsProps> = ({
  guestStats,
  budgetStats,
  taskStats,
  daysRemaining,
}) => {
  const navigate = useNavigate();

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
          color="secondary"
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
