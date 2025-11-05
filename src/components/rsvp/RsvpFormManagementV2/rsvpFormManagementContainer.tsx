import React from "react";
import { Box, Grid, Typography } from "@mui/material";

import QuestionSelector from "./QuestionSelector";
import RsvpFormPreview from "./RsvpFormPreview";

const RsvpFormManagementContainer: React.FC = () => {
  return (
    <Grid container sx={{ height: "100%" }}>
      {/* Sidebar - Question Selector */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%" }}>
        <QuestionSelector />
      </Grid>

      {/* Main Content - Form Preview/Editor */}
      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{
          borderLeft: { xs: "none", md: "1px solid" },
          borderColor: "divider",
          height: "100%",
        }}
      >
        <RsvpFormPreview />
      </Grid>
    </Grid>
  );
};

export default RsvpFormManagementContainer;
