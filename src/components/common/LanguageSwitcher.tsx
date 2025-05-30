import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useLocalization } from "../../localization/LocalizationContext";
import { Language, LANGUAGE_CONFIG } from "../../localization/types";

interface LanguageSwitcherProps {
  variant?: "icon" | "menu";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "icon",
}) => {
  const { language, setLanguage, t } = useLocalization();
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

  const currentLanguageConfig = LANGUAGE_CONFIG[language];

  if (variant === "icon") {
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
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {Object.entries(LANGUAGE_CONFIG).map(([langCode, config]) => (
            <MenuItem
              key={langCode}
              onClick={() => handleLanguageSelect(langCode as Language)}
              selected={language === langCode}
            >
              <ListItemText
                primary={config.nativeName}
                secondary={config.name}
              />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
  return (
    <>
      {Object.entries(LANGUAGE_CONFIG).map(([langCode, config]) => (
        <MenuItem
          key={langCode}
          onClick={() => handleLanguageSelect(langCode as Language)}
          selected={language === langCode}
        >
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText primary={config.nativeName} secondary={config.name} />
        </MenuItem>
      ))}
    </>
  );
};

export default LanguageSwitcher;
