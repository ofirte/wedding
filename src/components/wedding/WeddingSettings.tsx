import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Save as SaveIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useWeddingDetails, useUpdateWedding } from "../../hooks/auth";
import { Wedding } from "../../api/wedding/weddingApi";
import { responsivePatterns } from "../../utils/ResponsiveUtils";

const WeddingSettings: React.FC = () => {
  const navigate = useNavigate();
  const { data: weddingDetails, isLoading } = useWeddingDetails();
  const { mutate: updateWedding, isPending: isUpdating } = useUpdateWedding();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brideName: "",
    groomName: "",
    venueName: "",
    date: null as Date | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when wedding details load
  useEffect(() => {
    if (weddingDetails) {
      setFormData({
        name: weddingDetails.name || "",
        brideName: weddingDetails.brideName || "",
        groomName: weddingDetails.groomName || "",
        venueName: weddingDetails.venueName || "",
        date: weddingDetails.date
          ? new Date(weddingDetails.date.seconds * 1000)
          : null,
      });
    }
  }, [weddingDetails]);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
      setSuccess(false);
    };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!weddingDetails?.id) {
      setError("Wedding ID not found");
      return;
    }

    if (!formData.name.trim()) {
      setError("Wedding name is required");
      return;
    }

    try {
      const updateData: Partial<Wedding> = {
        name: formData.name.trim(),
        brideName: formData.brideName.trim() || undefined,
        groomName: formData.groomName.trim() || undefined,
        venueName: formData.venueName.trim() || undefined,
      };

      if (formData.date) {
        updateData.date = formData.date as any; // Will be converted to Timestamp in the API
      }

      await new Promise<void>((resolve, reject) => {
        updateWedding(
          { weddingId: weddingDetails.id, data: updateData },
          {
            onSuccess: () => {
              setSuccess(true);
              resolve();
            },
            onError: (error: any) => {
              setError(error.message || "Failed to update wedding settings");
              reject(error);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message || "Failed to update wedding settings");
    }
  };

  const handleBack = () => {
    navigate("../home");
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!weddingDetails) {
    return (
      <Box sx={responsivePatterns.containerPadding}>
        <Alert severity="error">
          Wedding details not found. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={responsivePatterns.containerPadding}>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={handleBack}
              sx={{ color: "text.secondary" }}
            >
              Back
            </Button>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "info.dark" }}
            >
              Wedding Settings
            </Typography>
          </Box>

          <Divider />

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Wedding settings updated successfully!
            </Alert>
          )}

          {/* Form */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Wedding Name */}
                <TextField
                  required
                  fullWidth
                  id="weddingName"
                  label="Wedding Name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Enter wedding name"
                />

                {/* Couple Names */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="brideName"
                      label="Bride Name"
                      value={formData.brideName}
                      onChange={handleInputChange("brideName")}
                      placeholder="Enter bride name"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="groomName"
                      label="Groom Name"
                      value={formData.groomName}
                      onChange={handleInputChange("groomName")}
                      placeholder="Enter groom name"
                    />
                  </Grid>
                </Grid>

                {/* Venue Name */}
                <TextField
                  fullWidth
                  id="venueName"
                  label="Venue Name"
                  value={formData.venueName}
                  onChange={handleInputChange("venueName")}
                  placeholder="Enter venue name"
                />

                {/* Wedding Date */}
                <DatePicker
                  label="Wedding Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />

                {/* Save Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={isUpdating}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {isUpdating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </Stack>
            </Box>
          </LocalizationProvider>

          <Divider />

          {/* Wedding Information Display */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Wedding Information
            </Typography>
            <Stack spacing={1} sx={{ color: "text.secondary" }}>
              <Typography variant="body2">
                <strong>Wedding ID:</strong> {weddingDetails.id}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong>{" "}
                {weddingDetails.createdAt
                  ? new Date(weddingDetails.createdAt).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Invitation Code:</strong>{" "}
                {weddingDetails.invitationCode || "Not generated"}
              </Typography>
              <Typography variant="body2">
                <strong>Users:</strong> {weddingDetails.userIds?.length || 0}{" "}
                member(s)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default WeddingSettings;
