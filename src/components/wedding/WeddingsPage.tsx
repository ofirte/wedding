import React, { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
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

  const { upcomingWeddings, archivedWeddings } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming: Wedding[] = [];
    const archived: Wedding[] = [];
    weddings.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    weddings.forEach((wedding) => {
      const weddingDate = new Date(wedding.date);
      if (weddingDate >= today) {
        upcoming.push(wedding);
      } else {
        archived.push(wedding);
      }
    });

    return { upcomingWeddings: upcoming, archivedWeddings: archived };
  }, [weddings]);

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
      {/* Header with title and New Wedding button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          {t("weddings.yourWeddings")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateWedding}
        >
          {t("weddings.newWedding")}
        </Button>
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
          {/* Upcoming Weddings Section */}
          <Box mb={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("weddings.upcomingWeddings")}
            </Typography>
            {upcomingWeddings.length > 0 ? (
              <Grid container spacing={3}>
                {upcomingWeddings.map((wedding: Wedding) => (
                  <Grid key={wedding.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <WeddingCard
                      wedding={wedding}
                      onSelect={handleWeddingSelect}
                      showCountdown
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary">
                  {t("weddings.noUpcomingWeddings")}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Past Weddings Archive */}
          {archivedWeddings.length > 0 && (
            <Box mt={4}>
              <Accordion
                defaultExpanded={false}
                sx={{
                  bgcolor: "action.hover",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" color="text.secondary">
                      {t("weddings.archive")} ({archivedWeddings.length})
                    </Typography>
                    <Tooltip title={t("weddings.archiveTooltip")} arrow>
                      <InfoOutlinedIcon
                        fontSize="small"
                        color="action"
                      />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ opacity: 0.85 }}>
                  <Grid container spacing={3}>
                    {archivedWeddings.map((wedding: Wedding) => (
                      <Grid key={wedding.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <WeddingCard
                          wedding={wedding}
                          onSelect={handleWeddingSelect}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
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
