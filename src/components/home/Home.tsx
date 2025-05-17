import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";

// Mock wedding date - you can replace with real data later
const weddingDate = new Date("2025-09-19");

const Home: React.FC = () => {
  return (
    <Box sx={{ py: 4, px: 1 }}>
      <WeddingCountdownBanner />
      <StatCards />
      <DetailedOverviewCards />
    </Box>
  );
};

export default Home;
