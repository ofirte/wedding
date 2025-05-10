import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Budget_OverviewCard from "./BudgetOverviewCard";
import Guest_OverviewCard from "./GuestsOverviewCards";
import Task_OverviewCard from "./TaskOverviewCard";

const DetailedOverviewCards: React.FC = () => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Budget_OverviewCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Guest_OverviewCard />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Task_OverviewCard />
      </Grid>
    </Grid>
  );
};

export default DetailedOverviewCards;
