import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import {  useRolePermissions } from "../../hooks/auth";
import { useTranslation } from "../../localization/LocalizationContext";

const ManageBackButton: React.FC = () => {
  const navigate = useNavigate();
  const { hasProducerAccess } = useRolePermissions();
  const { t } = useTranslation();
  const handleBackClick = () => {
    navigate("/weddings/manage");
  };

  if (!hasProducerAccess) {
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
