import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useWeddingDetails } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileAppBarProps {
  onMenuClick: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const { data: weddingDetails } = useWeddingDetails();
  const { t } = useTranslation();

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
            {t("home.title")}
          </Typography>
          {weddingDetails && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {weddingDetails.name}
            </Typography>
          )}
        </Box>

        <LanguageSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default MobileAppBar;
