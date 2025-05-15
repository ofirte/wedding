import React, { useState } from "react";
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
import { useNavigate } from "react-router";
import {
  useCurrentUser,
  useCreateWedding,
  useJoinWedding,
} from "../../hooks/auth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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

  // Create wedding form fields
  const [weddingName, setWeddingName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);

  // Join wedding form field
  const [weddingId, setWeddingId] = useState("");

  const { data: currentUser } = useCurrentUser();
  const { mutate: createWedding, isPending: isCreating } = useCreateWedding({
    onSuccess: () => {
      console.log('here')
      navigate("/");
    },
  });
  const { mutate: joinWedding, isPending: isJoining } = useJoinWedding({
    onSuccess: () => {
      navigate("/");
    },
  });
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.uid) {
      setError("You must be logged in to create a wedding");
      return;
    }

    if (!weddingName) {
      setError("Please enter a name for your wedding");
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
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleJoinWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.uid) {
      setError("You must be logged in to join a wedding");
      return;
    }

    if (!weddingId) {
      setError("Please enter a wedding ID");
      return;
    }

    try {
      joinWedding({ userId: currentUser.uid, weddingId });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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
          Set Up Your Wedding
        </Typography>

        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Welcome, {currentUser.displayName || "New User"}! Let's set up your
          wedding.
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
          <Tab label="Create New Wedding" />
          <Tab label="Join Existing Wedding" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleCreateWedding}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="weddingName"
                label="Wedding Name"
                placeholder="e.g., Alice & Bob's Wedding"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="brideName"
                    label="Bride's Name"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="groomName"
                    label="Groom's Name"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                  />
                </Grid>
              </Grid>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Wedding Date"
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
                {isCreating ? <CircularProgress size={24} /> : "Create Wedding"}
              </Button>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleJoinWedding}>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter the wedding ID that was shared with you to join an
                existing wedding plan.
              </Typography>

              <TextField
                required
                fullWidth
                id="weddingId"
                label="Wedding ID"
                placeholder="e.g., AbCdEf123456"
                value={weddingId}
                onChange={(e) => setWeddingId(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isJoining}
              >
                {isJoining ? <CircularProgress size={24} /> : "Join Wedding"}
              </Button>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SetupWeddingPage;
