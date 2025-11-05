import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface RSVPFormEmptyStateProps {
  onCreateForm: () => void;
  isCreating: boolean;
}

const RSVPFormEmptyState: React.FC<RSVPFormEmptyStateProps> = ({
  onCreateForm,
  isCreating,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            textAlign: "center",
            p: 8,
            borderRadius: 4,
            border: "2px dashed #d1d5db",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="#374151"
            gutterBottom
          >
            📝 {t("rsvpEmptyState.title")}
          </Typography>
          <Typography
            variant="body1"
            color="#6b7280"
            sx={{ mb: 4, maxWidth: 600, mx: "auto", lineHeight: 1.6 }}
          >
            {t("rsvpEmptyState.description")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onCreateForm}
            disabled={isCreating}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 600,
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            {isCreating ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: "white" }} />
                {t("rsvpEmptyState.creating")}
              </>
            ) : (
              `🎉 ${t("rsvpEmptyState.createButton")}`
            )}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default RSVPFormEmptyState;
