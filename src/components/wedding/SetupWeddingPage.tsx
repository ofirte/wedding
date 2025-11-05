import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { useCurrentUser, useUpdateUser } from "../../hooks/auth";
import { useCreateWedding, useJoinWedding } from "../../hooks/wedding";
import { Wedding } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { CreateWeddingForm, WeddingFormValues } from "./CreateWeddingForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wedding-tabpanel-${index}`}
      aria-labelledby={`wedding-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SetupWeddingPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Add these new state variables for invitation codes
  const [searchParams] = useSearchParams();
  const [invitationCode, setInvitationCode] = useState("");

  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutate: createWedding, isPending: isCreating } = useCreateWedding({
    onSuccess: async (weddingId) => {
      console.log("Wedding created successfully:", weddingId);
      await updateUser({
        userData: {
          weddingIds: [...(currentUser?.weddingIds || []), weddingId],
        },
      });
      navigate(`./${weddingId}/home`);
    },
  });
  const { mutate: joinWedding, isPending: isJoining } = useJoinWedding({
    onSuccess: async (wedding: Wedding) => {
      await updateUser({
        userData: {
          weddingIds: [...(currentUser?.weddingIds || []), wedding.id],
        },
      });
      navigate(`./${wedding.id}/home`);
    },
  });
  const navigate = useNavigate();

  // Add this useEffect to check for invitation codes in URL
  useEffect(() => {
    const inviteCode = searchParams.get("invite");
    if (inviteCode) {
      setInvitationCode(inviteCode);
      setTabValue(1); // Switch to join tab
    }
  }, [searchParams]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleCreateWedding = async (
    weddingData: Omit<Wedding, "id" | "createdAt" | "userIds" | "members">,
    userId: string
  ) => {
    try {
      createWedding({ weddingData, userId });
    } catch (err: any) {
      setError(err.message || t("common.unexpectedError"));
    }
  };

  const handleJoinWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.uid) {
      setError(t("common.mustBeLoggedIn"));
      return;
    }

    if (!invitationCode) {
      setError(t("common.pleaseEnterInvitationCode"));
      return;
    }

    try {
      joinWedding({
        userId: currentUser.uid,
        weddingIdentifier: invitationCode,
        isInvitationCode: true,
      });
    } catch (err: any) {
      setError(err.message || t("common.unexpectedError"));
    }
  };

  if (!currentUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          maxWidth: 700,
          width: "100%",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          {t("common.setupWedding")}
        </Typography>

        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          {t("common.welcomeNewUser")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label={t("common.createNewWedding")} />
          <Tab label={t("common.joinExistingWedding")} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CreateWeddingForm
            onSubmit={handleCreateWedding}
            loading={isCreating}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleJoinWedding}>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("common.joinWeddingDescription")}
              </Typography>

              <TextField
                required
                fullWidth
                id="invitationCode"
                label={t("common.invitationCode")}
                placeholder={t("placeholders.enterInvitationCode")}
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isJoining}
              >
                {isJoining ? (
                  <CircularProgress size={24} />
                ) : (
                  t("common.joinWedding")
                )}
              </Button>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SetupWeddingPage;
