import React, { useState } from "react";
import { Box, Container, Tab, Tabs, Paper, Button } from "@mui/material";
import { Settings, People, Favorite, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import UserManagementPage from "./UserManagementPage";
import WeddingManagementPage from "../weddingManagement/WeddingManagementPage";
import MigrationManager from "../../migrations/components/MigrationManager";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    "aria-controls": `admin-tabpanel-${index}`,
  };
};

export const AdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackToWeddings = () => {
    navigate("/weddings");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label={t("admin.navigationTabs")}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                minWidth: 120,
                px: 3,
              },
            }}
          >
            <Tab
              icon={<People />}
              iconPosition="start"
              label={t("admin.tabs.users")}
              {...a11yProps(0)}
            />
            <Tab
              icon={<Favorite />}
              iconPosition="start"
              label={t("admin.tabs.weddings")}
              {...a11yProps(1)}
            />
            <Tab
              icon={<Settings />}
              iconPosition="start"
              label={t("admin.tabs.migrations")}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserManagementPage />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <WeddingManagementPage />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MigrationManager />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPage;
