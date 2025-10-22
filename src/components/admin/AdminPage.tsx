import React, { useEffect } from "react";
import { Box, Container, Tab, Tabs, Paper } from "@mui/material";
import { Settings, People, Favorite, Description } from "@mui/icons-material";
import { useSearchParams } from "react-router";
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

// Tab values as constants for better type safety
const TabValue = {
  USERS: "users",
  WEDDINGS: "weddings",
  TEMPLATES: "templates",
  MIGRATIONS: "migrations",
} as const;

type TabValueType = (typeof TabValue)[keyof typeof TabValue];

// Map tab values to numeric indices for Material-UI Tabs component
const tabValueToIndex = {
  [TabValue.USERS]: 0,
  [TabValue.WEDDINGS]: 1,
  [TabValue.TEMPLATES]: 2,
  [TabValue.MIGRATIONS]: 3,
};

const indexToTabValue: Record<number, TabValueType> = {
  0: TabValue.USERS,
  1: TabValue.WEDDINGS,
  2: TabValue.TEMPLATES,
  3: TabValue.MIGRATIONS,
};

export const AdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // Get tab from URL query param, default to USERS if not present or invalid
  const tabFromUrl = searchParams.get("tab") as TabValueType;
  const isValidTab = Object.values(TabValue).includes(tabFromUrl);
  const activeTabValue = isValidTab ? tabFromUrl : TabValue.USERS;
  const activeTabIndex = tabValueToIndex[activeTabValue];

  // Update URL when tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const newTabValue = indexToTabValue[newValue];
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", newTabValue);
    setSearchParams(newSearchParams);
  };

  // Set initial tab in URL if not present or invalid
  useEffect(() => {
    if (!tabFromUrl || !isValidTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", TabValue.USERS);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [tabFromUrl, isValidTab, searchParams, setSearchParams]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTabIndex}
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
              icon={<Description />}
              iconPosition="start"
              label={t("admin.tabs.templates")}
              {...a11yProps(2)}
            />
            <Tab
              icon={<Settings />}
              iconPosition="start"
              label={t("admin.tabs.migrations")}
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTabIndex} index={0}>
          <UserManagementPage />
        </TabPanel>

        <TabPanel value={activeTabIndex} index={1}>
          <WeddingManagementPage />
        </TabPanel>

        {/* <TabPanel value={activeTabIndex} index={2}>
          <GlobalTemplatesManager />
        </TabPanel> */}

        <TabPanel value={activeTabIndex} index={3}>
          <MigrationManager />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPage;
