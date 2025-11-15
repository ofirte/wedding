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
  Event as WeddingsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Task as TaskIcon,
  ContentCopy as TemplateIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser, useSignOut, useIsAdmin } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useResponsive } from "../../utils/ResponsiveUtils";

interface ManageSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ManageSidebar: React.FC<ManageSidebarProps> = ({
  mobileOpen = false,
  onMobileClose = () => {},
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { mutate: signOut } = useSignOut();
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();

  const menuItems = [
    {
      text: t("nav.weddings"),
      icon: <WeddingsIcon />,
      path: "/weddings/manage",
    },
    { text: t("nav.tasks"), icon: <TaskIcon />, path: "/weddings/tasks" },
    { text: t("nav.taskTemplates"), icon: <TemplateIcon />, path: "/weddings/task-templates" },
  ];

  const adminMenuItems = [
    { text: t("nav.admin"), icon: <AdminIcon />, path: "/weddings/admin" },
  ];

  // Function to check if a menu item is currently active
  const isMenuItemActive = (itemPath: string) => {
    if (itemPath === "/weddings") {
      return (
        location.pathname === "/weddings" ||
        !location.pathname.includes("/admin")
      );
    }
    return location.pathname.includes(itemPath);
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

  const handleNavigate = (path: string) => {
    navigate(path);
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
          {t("manage.title")}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("manage.subtitle")}
        </Typography>
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
            </React.Fragment>
          );
        })}
      </List>

      {/* Admin Section - Only visible to admins */}
      {isAdmin && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: "medium" }}
            >
              {t("manage.adminTools")}
            </Typography>
          </Box>
          <List sx={{ py: 0, pb: 1 }}>
            {adminMenuItems.map((item, index) => {
              const isActive = isMenuItemActive(item.path);
              const styles = getMenuItemStyles(isActive);

              return (
                <ListItem key={item.text} disablePadding>
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
              );
            })}
          </List>
        </>
      )}

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

export default ManageSidebar;
