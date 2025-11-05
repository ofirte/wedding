import React from "react";
import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";

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
    navigate("/weddings/manage");
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
