import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
} from "@mui/icons-material";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface GeneralMobileAppBarProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  backButtonPath?: string;
}

const GeneralMobileAppBar: React.FC<GeneralMobileAppBarProps> = ({
  onMenuClick,
  title,
  subtitle,
}) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: "flex", md: "none" },
        backgroundColor: theme.palette.sage.light,
        color: theme.palette.sage.contrastText,
        boxShadow: theme.shadows[2],
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56 } }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <LanguageSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default GeneralMobileAppBar;
