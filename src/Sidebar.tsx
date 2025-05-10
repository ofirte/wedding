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
} from "@mui/material";
import {
  Home as HomeIcon,
  List as ListIcon,
  Money as MoneyIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";

const Sidebar: React.FC = () => {
  const theme = useTheme();

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Invite List", icon: <ListIcon />, path: "/invite" },
    { text: "Budget Planner", icon: <MoneyIcon />, path: "/budget" },
    { text: "Tasks", icon: <TaskIcon />, path: "/tasks" },
  ];

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
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          The Wedding Planner
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem
              component="a"
              href={item.path}
              sx={{
                py: 1.5,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.light,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: "medium",
                }}
              />
            </ListItem>
            {index < menuItems.length - 1 && (
              <Divider variant="middle" sx={{ my: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
