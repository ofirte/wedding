import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTranslation } from "src/localization/LocalizationContext";
import { useAllWeddings } from "src/hooks/wedding/useAllWeddings";
import { useAddUserToWedding } from "src/hooks/wedding/useAddUserToWedding";
import { WeddingTable } from "./WeddingTable";
import { WeddingDetailsDialog } from "./WeddingDetailsDialog";
import { Wedding } from "@wedding-plan/types";
import { useUpdateUser } from "src/hooks/auth";
import { arrayUnion } from "firebase/firestore";

const WeddingManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: updateUser } = useUpdateUser({
    onError: (error) => {
      console.error("Error updating user weddingIds:", error);
    },
  });
  // Fetch all weddings using the custom hook
  const { data: weddings = [], isLoading, error } = useAllWeddings();

  // Add user to wedding mutation using the custom hook
  const addUserToWeddingMutation = useAddUserToWedding({
    onError: (error) => {
      console.error("Error adding user to wedding:", error);
    },
  });

  const handleAddUserToWedding = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    setDialogOpen(true);
  };

  const handleSaveUser = (weddingId: string, userId: string, plan: string) => {
    // First, update user's weddingIds array to include this wedding
    updateUser({
      userId: userId,
      userData: {
        weddingIds: arrayUnion(weddingId),
      },
    });

    // Then add user to the wedding's members
    addUserToWeddingMutation.mutate({
      weddingId,
      userId,
      plan: plan as any, // Type assertion since we know it's a valid plan
      addedBy: "admin",
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedWedding(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {t("weddingManagement.errorLoadingWeddings")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("weddingManagement.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("weddingManagement.description")}
        </Typography>
      </Box>

      <WeddingTable
        weddings={weddings}
        onAddUserToWedding={handleAddUserToWedding}
        isUpdating={addUserToWeddingMutation.isPending}
      />

      <WeddingDetailsDialog
        open={dialogOpen}
        weddingId={selectedWedding?.id || ""}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        isLoading={addUserToWeddingMutation.isPending}
      />
    </Container>
  );
};

export default WeddingManagementPage;
