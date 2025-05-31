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
import {
  useCurrentUser,
  useCreateWedding,
  useJoinWedding,
} from "../../hooks/auth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Wedding } from "../../api/wedding/weddingApi";
import { useTranslation } from "../../localization/LocalizationContext";

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

  // Create wedding form fields
  const [weddingName, setWeddingName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { mutate: createWedding, isPending: isCreating } = useCreateWedding({
    onSuccess: (weddingId) => {
      console.log("Wedding created successfully:", weddingId);
      navigate(`./${weddingId}/home`);
    },
  });
  const { mutate: joinWedding, isPending: isJoining } = useJoinWedding({
    onSuccess: (wedding: Wedding) => {
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

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.uid) {
      setError(t("common.mustBeLoggedIn"));
      return;
    }

    if (!weddingName) {
      setError(t("common.pleaseEnterWeddingName"));
      return;
    }

    try {
      createWedding({
        userId: currentUser.uid,
        weddingName,
        brideName: brideName || undefined,
        groomName: groomName || undefined,
        weddingDate: weddingDate || undefined,
      });
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
        weddingId: invitationCode,
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
          <Box component="form" onSubmit={handleCreateWedding}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="weddingName"
                label={t("common.weddingName")}
                placeholder={t("placeholders.exampleWeddingName")}
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="brideName"
                    label={t("common.brideName")}
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="groomName"
                    label={t("common.groomName")}
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                  />
                </Grid>
              </Grid>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("common.weddingDate")}
                  value={weddingDate}
                  onChange={(date) => setWeddingDate(date)}
                />
              </LocalizationProvider>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isCreating}
              >
                {isCreating ? (
                  <CircularProgress size={24} />
                ) : (
                  t("common.createWedding")
                )}
              </Button>
            </Stack>
          </Box>
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
