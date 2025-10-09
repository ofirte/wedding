import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import { responsivePatterns } from "../../utils/ResponsiveUtils";

const Home: React.FC = () => {
  return (
    <Box sx={responsivePatterns.containerPadding}>


      <WeddingCountdownBanner />
      <StatCards />
      <DetailedOverviewCards />
    </Box>
  );
};

export default Home;
