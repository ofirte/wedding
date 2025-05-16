import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import { useWeddingDetails } from "../../hooks/auth";

const Home: React.FC = () => {
  return (
    <Box sx={{ py: 4, px: 1 }}>
      <WeddingCountdownBanner  />
      <StatCards />
      <DetailedOverviewCards />
    </Box>
  );
};

export default Home;
