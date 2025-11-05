import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";
import ManageSidebar from "./ManageSidebar";
import GeneralMobileAppBar from "./GeneralMobileAppBar";
import { useTranslation } from "../../localization/LocalizationContext";
import useResponsive from "../../utils/ResponsiveUtils";
import { useRolePermissions } from "src/hooks/auth";
import AccessDenied from "./AccessDenied";

const ManageApp: React.FC = () => {
  const { isMobile } = useResponsive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { hasProducerAccess } = useRolePermissions();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  if (!hasProducerAccess) {
    return (
      <AccessDenied
        reason="general"
        title={t("manage.accessDeniedTitle")}
        message={t("manage.accessDeniedMessage")}
        redirectPath="/"
        redirectLabel={t("common.goToWeddings")}
      />
    );
  }
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isMobile && (
        <GeneralMobileAppBar
          onMenuClick={handleDrawerToggle}
          title={t("manage.title")}
          subtitle={t("manage.subtitle")}
        />
      )}
      <ManageSidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />
      {/* Main content area */}
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
};

export default ManageApp;
