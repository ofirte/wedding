import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  Button,
  Avatar,
  Stack,
  ListItemButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  List as ListIcon,
  Money as MoneyIcon,
  Assignment as TaskIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser, useSignOut, useWeddingDetails } from "./hooks/auth";
import { useTranslation } from "./localization/LocalizationContext";
import { LanguageSwitcher } from "./components/common/LanguageSwitcher";

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { data: weddingDetails } = useWeddingDetails();
  const { mutate: signOut } = useSignOut();
  const { t } = useTranslation();

  const menuItems = [
    { text: t("nav.home"), icon: <HomeIcon />, path: "/home" },
    { text: t("nav.guests"), icon: <ListIcon />, path: "/invite" },
    { text: t("nav.budget"), icon: <MoneyIcon />, path: "/budget" },
    { text: t("nav.tasks"), icon: <TaskIcon />, path: "/tasks" },
  ];

  // Function to check if a menu item is currently active
  const isMenuItemActive = (itemPath: string) => {
    return location.pathname.endsWith(itemPath);
  };

  // Function to get styles for menu items based on active state
  const getMenuItemStyles = (isActive: boolean) => ({
    listItemButton: {
      py: 1.5,
      backgroundColor: isActive ? theme.palette.sage.light : "transparent",
      "&:hover": {
        backgroundColor: isActive
          ? theme.palette.sage.light
          : theme.palette.action.hover,
      },
      borderRight: isActive
        ? `3px solid ${theme.palette.sage.dark}`
        : "3px solid transparent",
    },
    listItemIcon: {
      color: theme.palette.sage.dark,
      minWidth: "auto",
      marginInlineEnd: 2,
    },
    listItemText: {
      fontWeight: isActive ? "bold" : "medium",
      color: isActive ? theme.palette.sage.dark : "inherit",
    },
  });

  const handleLogout = async () => {
    try {
      signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Don't render sidebar for unauthenticated users
  if (!currentUser) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          boxShadow: theme.shadows[2],
          border: "none",
        },
      }}
    >
      <Box
        sx={{
          padding: 2,
          backgroundColor: theme.palette.sage.light,
          color: theme.palette.sage.contrastText,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("home.title")}
        </Typography>
        {weddingDetails && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {weddingDetails.name}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={currentUser?.displayName || "User"}
            src={currentUser?.photoURL || undefined}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {currentUser?.displayName || currentUser?.email}
            </Typography>
          </Box>
          <LanguageSwitcher />
        </Stack>
      </Box>

      <Divider />
      <List sx={{ py: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = isMenuItemActive(item.path);
          const styles = getMenuItemStyles(isActive);

          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate(`.${item.path}`)}
                  sx={styles.listItemButton}
                >
                  <ListItemIcon sx={styles.listItemIcon}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={styles.listItemText}
                  />
                </ListItemButton>
              </ListItem>
              {index < menuItems.length - 1 && (
                <Divider variant="middle" sx={{ my: 0.5 }} />
              )}
            </React.Fragment>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
        >
          {t("common.signOut")}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
