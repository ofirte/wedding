import React, { useState } from "react";
import "./App.css";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import GeneralMobileAppBar from "./components/common/GeneralMobileAppBar";
import { useWeddingDetails } from "./hooks/auth";
import { useTranslation } from "./localization/LocalizationContext";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { data: weddingDetails } = useWeddingDetails();
  const { t } = useTranslation();

  const handleMobileMenuToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isMobile && (
        <GeneralMobileAppBar
          onMenuClick={handleMobileMenuToggle}
          title={t("home.title")}
          subtitle={weddingDetails?.name}
        />
      )}

      <Sidebar
        mobileOpen={mobileDrawerOpen}
        onMobileClose={handleMobileDrawerClose}
      />

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: { xs: 1, md: 2 },
          px: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 7, md: 0 }, // Account for mobile app bar height
          width: {
            xs: "100%",
            md: `calc(100% - 240px)`,
          },
          minHeight: { xs: "calc(100vh - 56px)", md: "100vh" },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default App;
