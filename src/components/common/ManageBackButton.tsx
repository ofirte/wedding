import React from "react";
import { IconButton, Button, useTheme } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";
import { useResponsive } from "../../utils/ResponsiveUtils";

const ManageBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { t } = useTranslation();

  // Only show if user has more than one wedding
  const shouldShowBackButton =
    currentUser?.weddingIds && currentUser.weddingIds.length > 1;

  const handleBackClick = () => {
    // If we're in admin section, go back to main weddings page
    if (location.pathname.includes("/admin")) {
      navigate("/weddings");
    } else {
      // Otherwise, navigate back or to weddings page
      navigate("/weddings");
    }
  };
  
  if (!shouldShowBackButton) {
    return null;
  }

  return (
    <Button
      onClick={handleBackClick}
      variant="outlined"
      color="inherit"
      fullWidth
    >
      {t("nav.weddings")}
    </Button>
  );
};

export default ManageBackButton;
