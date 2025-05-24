import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    handleClose();
  };
  const isHebrew = language === "he";
  const isEnglish = language === "en";

  const getCurrentLanguageLabel = () => {
    return isHebrew ? "עב" : "EN";
  };

  return (
    <>
      <Chip
        icon={<LanguageIcon />}
        label={getCurrentLanguageLabel()}
        onClick={handleClick}
        variant="outlined"
        size="small"
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange("en")}
          selected={isEnglish}
          sx={{
            minWidth: 120,
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>🇺🇸</Typography>
            <Typography>English</Typography>
          </Box>
          {isEnglish && (
            <CheckIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: 20,
              }}
            />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange("he")}
          selected={isHebrew}
          sx={{
            minWidth: 120,
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>🇮🇱</Typography>
            <Typography>עברית</Typography>
          </Box>
          {isHebrew && (
            <CheckIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: 20,
              }}
            />
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
