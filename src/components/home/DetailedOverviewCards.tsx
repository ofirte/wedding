import React from "react";
import { Grid2 as Grid } from "@mui/material";
import BudgetOverviewCard from "./BudgetOverviewCard";
import GuestOverviewCard from "./GuestsOverviewCards";
import TaskOverviewCard from "./TaskOverviewCard";

const DetailedOverviewCards: React.FC = () => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetOverviewCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <GuestOverviewCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TaskOverviewCard />
      </Grid>
    </Grid>
  );
};

export default DetailedOverviewCards;
