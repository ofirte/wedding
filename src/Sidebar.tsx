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
  WhatsApp as RSVPIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser, useSignOut, useWeddingDetails } from "./hooks/auth";
import { useTranslation } from "./localization/LocalizationContext";
import { LanguageSwitcher } from "./components/common/LanguageSwitcher";
import { useResponsive } from "./utils/ResponsiveUtils";
import ManageBackButton from "./components/common/ManageBackButton";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onMobileClose = () => {},
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
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
    { text: t("nav.rsvp"), icon: <RSVPIcon />, path: "/rsvp" },
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
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigate = (path: string, isAbsolute = false) => {
    if (isAbsolute) {
      navigate(path);
    } else {
      navigate(`.${path}`);
    }
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  // Don't render sidebar for unauthenticated users
  if (!currentUser) {
    return null;
  }

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        mt: isMobile ? 6 : 0,
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
          {!isMobile && (
            <Stack direction="row" spacing={1}>
              <LanguageSwitcher />
              <Button
                size="small"
                variant="text"
                onClick={() => handleNavigate("/settings")}
                sx={{
                  minWidth: "auto",
                  p: 0.5,
                  color: theme.palette.sage.dark,
                  "&:hover": {
                    backgroundColor: theme.palette.sage.light,
                  },
                }}
              >
                <SettingsIcon fontSize="small" />
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Divider />
      <List sx={{ py: 1, flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = isMenuItemActive(item.path);
          const styles = getMenuItemStyles(isActive);
          return (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
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

      <Divider />
      <Box sx={{ p: 2, gap: 2, display: "flex", flexDirection: "column" }}>
        <ManageBackButton />

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
          sx={{
            color: theme.palette.error.main,
          }}
        >
          {t("common.signOut")}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", md: "flex" },
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
        {drawerContent}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: "flex", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            boxShadow: theme.shadows[2],
            border: "none",
          },
        }}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
