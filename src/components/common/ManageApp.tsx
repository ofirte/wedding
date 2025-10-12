import React, { useState } from "react";
import { Box, useTheme, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Outlet } from "react-router";
import ManageSidebar from "./ManageSidebar";
import ManageBackButton from "./ManageBackButton";
import { useResponsive } from "../../utils/ResponsiveUtils";

const ManageApp: React.FC = () => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <ManageSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",

          minHeight: "100vh",
        }}
      >
        {/* Mobile header with menu button */}
        {isMobile && (
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              padding: 2,
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              gap: 1,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <ManageBackButton />
          </Box>
        )}

        {/* Content area */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ManageApp;
