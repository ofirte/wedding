import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useCurrentUser } from "../../hooks/auth/useCurrentUser";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";

import { useTranslation } from "../../localization/LocalizationContext";
import WeddingCard from "./WeddingCard";
import { Wedding } from "@wedding-plan/types";
import { CreateWeddingDialog } from "./CreateWeddingDialog";
import { WeddingsEmptyState } from "./WeddingsEmptyState";

const WeddingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useCurrentUser();
  const {
    data: weddings = [],
    isLoading: isWeddingsLoading,
    error: weddingsError,
  } = useWeddingsDetails(currentUser?.weddingIds || []);
  const handleWeddingSelect = (weddingId: string) => {
    navigate(`/wedding/${weddingId}/home`);
  };
  const [isCreateWeddingDialogOpen, setIsCreateWeddingDialogOpen] =
    useState(false);

  const handleCreateWedding = () => {
    setIsCreateWeddingDialogOpen(true);
  };

  if (isUserLoading) {
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

  if (userError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{t("weddings.errorLoadingUserData")}</Alert>
      </Container>
    );
  }

  if (!currentUser?.weddingIds || currentUser.weddingIds.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <WeddingsEmptyState onCreateWedding={handleCreateWedding} />
        <CreateWeddingDialog
          open={isCreateWeddingDialogOpen}
          onClose={() => setIsCreateWeddingDialogOpen(false)}
          onAccept={(weddingId) => {
            handleWeddingSelect(weddingId);
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("weddings.yourWeddings")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("weddings.selectWeddingMessage")}
        </Typography>
      </Box>

      {weddingsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("weddings.errorLoadingWeddings")}
        </Alert>
      )}

      {isWeddingsLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {weddings.map((wedding: Wedding) => (
              <Grid key={wedding.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <WeddingCard wedding={wedding} onSelect={handleWeddingSelect} />
              </Grid>
            ))}
          </Grid>

          <Box mt={4} textAlign="center">
            <Button
              variant="outlined"
              size="large"
              onClick={handleCreateWedding}
            >
              {t("weddings.createAnotherWedding")}
            </Button>
          </Box>
        </>
      )}
      <CreateWeddingDialog
        open={isCreateWeddingDialogOpen}
        onClose={() => setIsCreateWeddingDialogOpen(false)}
        onAccept={(weddingId) => {
          handleWeddingSelect(weddingId);
        }}
      />
    </Container>
  );
};

export default WeddingsPage;
