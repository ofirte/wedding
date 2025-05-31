import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import InvitationShareButton from "./InvitationShareButton";

// Mock wedding date - you can replace with real data later
const weddingDate = new Date("2025-09-19");

const Home: React.FC = () => {
  return (
    <Box sx={{ py: 4, px: 1, position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 48,
          right: 16,
          zIndex: 10,
        }}
      >
        <InvitationShareButton />
      </Box>

      <WeddingCountdownBanner />
      <StatCards />
      <DetailedOverviewCards />
    </Box>
  );
};

export default Home;
