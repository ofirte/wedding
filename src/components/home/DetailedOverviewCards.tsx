import React from "react";
import { Grid2 as Grid } from "@mui/material";
import BudgetOverviewCard from "./BudgetOverviewCard";
import GuestListCard from "./GuestListCard";

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
}

const DetailedOverviewCards: React.FC<DetailedOverviewCardsProps> = ({
  budgetStats,
  guestStats,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Budget Overview */}
      <Grid size={{ xs: 12, md: 6 }}>
        <BudgetOverviewCard budgetStats={budgetStats} />
      </Grid>

      {/* Guest List Overview */}
      <Grid size={{ xs: 12, md: 6 }}>
        <GuestListCard guestStats={guestStats} />
      </Grid>
    </Grid>
  );
};

export default DetailedOverviewCards;
