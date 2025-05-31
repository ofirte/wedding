import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useLocalization } from "../../localization/LocalizationContext";
import { Language, LANGUAGE_CONFIG } from "../../localization/types";

interface LanguageSwitcherProps {}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = () => {
  const { language, setLanguage, t } = useLocalization();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    handleClose();
  };

  const getMenuItemStyles = (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.palette.sage.light : "transparent",
    borderLeft: isSelected
      ? `3px solid ${theme.palette.sage.dark}`
      : "3px solid transparent",
    "&:hover": {
      backgroundColor: isSelected
        ? theme.palette.sage.light
        : theme.palette.action.hover,
    },
  });

  return (
    <>
      <Tooltip title={t("common.changeLanguage") || "Change Language"}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "language-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
      >
        {Object.entries(LANGUAGE_CONFIG).map(([langCode, config]) => {
          const isSelected = language === langCode;
          return (
            <MenuItem
              key={langCode}
              onClick={() => handleLanguageSelect(langCode as Language)}
              selected={isSelected}
              sx={getMenuItemStyles(isSelected)}
            >
              <ListItemIcon
                sx={{
                  color: isSelected ? theme.palette.sage.dark : "inherit",
                  minWidth: "auto",
                  marginRight: 1,
                }}
              >
                {isSelected ? <CheckIcon /> : <LanguageIcon />}
              </ListItemIcon>
              <ListItemText
                primary={config.nativeName}
                secondary={config.name}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
