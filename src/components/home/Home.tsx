import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import useTasks from "../../hooks/tasks/useTasks";

// Mock wedding date - you can replace with real data later
const weddingDate = new Date("2025-09-19");

const Home: React.FC = () => {
  const calculateDaysRemaining = (): number => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysRemaining = calculateDaysRemaining();


  return (
    <Box sx={{ py: 4, px: 1 }}>
      <WeddingCountdownBanner weddingDate={weddingDate} />
      <StatCards
        daysRemaining={daysRemaining}
      />
      <DetailedOverviewCards />
    </Box>
  );
};

export default Home;
