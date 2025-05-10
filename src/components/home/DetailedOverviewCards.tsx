import React from "react";
import { Grid2 as Grid } from "@mui/material";
import BudgetOverviewCard from "./BudgetOverviewCard";
import GuestListCard from "./GuestListCard";
import TaskOverviewCard from "./TaskOverviewCard";

interface DetailedOverviewCardsProps {
  budgetStats: {
    total: number;
    spent: number;
    remaining: number;
  };
  guestStats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  taskStats: {
    total: number;
    completed: number;
    percentage: number;
  };
}

const DetailedOverviewCards: React.FC<DetailedOverviewCardsProps> = ({
  budgetStats,
  guestStats,
  taskStats,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetOverviewCard budgetStats={budgetStats} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <GuestListCard guestStats={guestStats} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TaskOverviewCard taskStats={taskStats} />
      </Grid>
    </Grid>
  );
};

export default DetailedOverviewCards;
