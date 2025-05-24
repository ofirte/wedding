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
import { useNavigate } from "react-router";
import { useCurrentUser, useSignOut, useWeddingDetails } from "./hooks/auth";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: weddingDetails } = useWeddingDetails();
  const { mutate: signOut } = useSignOut();

  const menuItems = [
    { text: t("navigation.home"), icon: <HomeIcon />, path: "/home" },
    { text: t("navigation.guests"), icon: <ListIcon />, path: "/invite" },
    { text: t("navigation.budget"), icon: <MoneyIcon />, path: "/budget" },
    { text: t("navigation.tasks"), icon: <TaskIcon />, path: "/tasks" },
  ];

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
      anchor={theme.direction === "rtl" ? "right" : "left"}
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
          {t("app.title")}
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
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(`.${item.path}`)}
                sx={{
                  py: 1.5,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.sage.dark,
                    minWidth: 40,
                    justifyContent: "center",
                    marginInlineEnd: 1,
                    marginInlineStart: 0,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: "medium",
                  }}
                  sx={{
                    textAlign: "start",
                    margin: 0,
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < menuItems.length - 1 && (
              <Divider variant="middle" sx={{ my: 0.5 }} />
            )}
          </React.Fragment>
        ))}
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
          sx={{
            "& .MuiButton-startIcon": {
              marginInlineEnd: 1,
              marginInlineStart: -1,
            },
            justifyContent: "flex-start",
          }}
        >
          {t("app.signOut")}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
