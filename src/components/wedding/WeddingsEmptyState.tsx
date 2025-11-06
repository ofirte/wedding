import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { FavoriteBorder, Add } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingsEmptyStateProps {
  onCreateWedding: () => void;
}

export const WeddingsEmptyState: React.FC<WeddingsEmptyStateProps> = ({
  onCreateWedding,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
      }}
    >
      <FavoriteBorder
        sx={{
          fontSize: 80,
          color: "text.secondary",
          opacity: 0.5,
          mb: 3,
        }}
      />

      <Typography variant="h4" component="h1" gutterBottom>
        {t("weddings.emptyState.title")}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 500 }}
      >
        {t("weddings.emptyState.description")}
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onCreateWedding}
        startIcon={<Add />}
      >
        {t("weddings.emptyState.createButton")}
      </Button>
    </Box>
  );
};
