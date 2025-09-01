import React from "react";
import { Box } from "@mui/material";
import WeddingCountdownBanner from "./WeddingCountdownBanner";
import StatCards from "./StatCards";
import DetailedOverviewCards from "./DetailedOverviewCards";
import InvitationShareButton from "./InvitationShareButton";
import { responsivePatterns } from "../../utils/ResponsiveUtils";

const Home: React.FC = () => {
  return (
    <Box sx={responsivePatterns.containerPadding}>
      <Box
        sx={{
          position: { xs: "relative", md: "absolute" },
          top: { xs: "auto", md: 48 },
          right: { xs: "auto", md: 16 },
          zIndex: 10,
          mb: { xs: 2, md: 0 },
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
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
