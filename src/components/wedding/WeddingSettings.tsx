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
  Card,
  CardMedia,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Save as SaveIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { UploadFile } from "../common/UploadFile";
import { useWeddingDetails, useUpdateWedding } from "../../hooks/auth";
import { Wedding } from "../../api/wedding/weddingApi";
import { responsivePatterns } from "../../utils/ResponsiveUtils";
import { useTranslation } from "../../localization/LocalizationContext";
import CurrentWeddingInfo from "./CurrentWeddingInfo";

const WeddingSettings: React.FC = () => {
  const { t } = useTranslation();
  const { data: weddingDetails, isLoading } = useWeddingDetails();
  const { mutate: updateWedding, isPending: isUpdating } = useUpdateWedding();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brideName: "",
    groomName: "",
    venueName: "",
    venueLink: "",
    date: null as Date | null,
    startTime: null as Date | null,
    invitationPhoto: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when wedding details load
  useEffect(() => {
    if (weddingDetails) {
      const parseTime = (timeString?: string) => {
        if (!timeString) return null;
        const [hours, minutes] = timeString.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      setFormData({
        name: weddingDetails.name || "",
        brideName: weddingDetails.brideName || "",
        groomName: weddingDetails.groomName || "",
        venueName: weddingDetails.venueName || "",
        venueLink: weddingDetails.venueLink || "",
        date: weddingDetails.date
          ? new Date(weddingDetails.date.seconds * 1000)
          : null,
        startTime: parseTime(weddingDetails.startTime),
        invitationPhoto: weddingDetails.invitationPhoto || "",
      });
    }
  }, [weddingDetails]);

  // Single unified handler for all form data changes
  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!weddingDetails?.id) {
      setError(t("weddingSettings.weddingIdNotFound"));
      return;
    }

    if (!formData.name.trim()) {
      setError(t("weddingSettings.weddingNameRequired"));
      return;
    }

    try {
      const updateData: Partial<Wedding> = {
        name: formData.name.trim(),
        brideName: formData.brideName.trim() || undefined,
        groomName: formData.groomName.trim() || undefined,
        venueName: formData.venueName.trim() || undefined,
        venueLink: formData.venueLink.trim() || undefined,
      };

      if (formData.date) {
        updateData.date = formData.date as any; // Will be converted to Timestamp in the API
      }

      if (formData.startTime) {
        const hours = formData.startTime.getHours().toString().padStart(2, "0");
        const minutes = formData.startTime
          .getMinutes()
          .toString()
          .padStart(2, "0");
        updateData.startTime = `${hours}:${minutes}`;
      }

      if (formData.invitationPhoto.trim()) {
        updateData.invitationPhoto = formData.invitationPhoto.trim();
      } else if (formData.invitationPhoto === "") {
        updateData.invitationPhoto = undefined; // This will remove the field
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
              setError(error.message || t("weddingSettings.updateFailed"));
              reject(error);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message || t("weddingSettings.updateFailed"));
    }
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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "info.dark" }}
          >
            {t("weddingSettings.title")}
          </Typography>

          <Divider />

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              {t("weddingSettings.settingsUpdatedSuccess")}
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
                  label={t("weddingSettings.weddingName")}
                  value={formData.name}
                  onChange={(e) => handleFormDataChange("name", e.target.value)}
                  placeholder={t("weddingSettings.weddingNamePlaceholder")}
                />

                {/* Couple Names */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="brideName"
                      label={t("weddingSettings.brideName")}
                      value={formData.brideName}
                      onChange={(e) =>
                        handleFormDataChange("brideName", e.target.value)
                      }
                      placeholder={t("weddingSettings.brideNamePlaceholder")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="groomName"
                      label={t("weddingSettings.groomName")}
                      value={formData.groomName}
                      onChange={(e) =>
                        handleFormDataChange("groomName", e.target.value)
                      }
                      placeholder={t("weddingSettings.groomNamePlaceholder")}
                    />
                  </Grid>
                </Grid>

                {/* Venue Name */}
                <TextField
                  fullWidth
                  id="venueName"
                  label={t("weddingSettings.venueName")}
                  value={formData.venueName}
                  onChange={(e) =>
                    handleFormDataChange("venueName", e.target.value)
                  }
                  placeholder={t("weddingSettings.venueNamePlaceholder")}
                />

                {/* Venue Link */}
                <TextField
                  fullWidth
                  id="venueLink"
                  label={t("weddingSettings.venueLink")}
                  value={formData.venueLink}
                  onChange={(e) =>
                    handleFormDataChange("venueLink", e.target.value)
                  }
                  placeholder={t("weddingSettings.venueLinkPlaceholder")}
                  type="url"
                />

                {/* Wedding Date and Time */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <DatePicker
                      label={t("weddingSettings.weddingDate")}
                      value={formData.date}
                      onChange={(date) => handleFormDataChange("date", date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TimePicker
                      label={t("weddingSettings.startTime")}
                      value={formData.startTime}
                      onChange={(time) =>
                        handleFormDataChange("startTime", time)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Invitation Photo */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {t("weddingSettings.invitationPhoto")}
                  </Typography>
                  {formData.invitationPhoto ? (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <Card sx={{ maxWidth: 300, mb: 2 }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={formData.invitationPhoto}
                          alt={t("weddingSettings.invitationPhoto")}
                          sx={{ objectFit: "contain" }}
                        />
                      </Card>
                      <IconButton
                        onClick={() =>
                          handleFormDataChange("invitationPhoto", "")
                        }
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "background.paper",
                          "&:hover": { bgcolor: "background.default" },
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <UploadFile
                      onUploadComplete={(url) =>
                        handleFormDataChange("invitationPhoto", url)
                      }
                      uploadPath={`weddings/${
                        weddingDetails?.id || "temp"
                      }/invitation-photos`}
                      buttonText={t("weddingSettings.uploadInvitationPhoto")}
                      fileTypes=".jpg,.jpeg,.png,.gif,.webp"
                      buttonColor="#9c88ff"
                      buttonHoverColor="#8c78ef"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {t("weddingSettings.invitationPhotoDescription")}
                  </Typography>
                </Box>

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
                      {t("weddingSettings.saving")}
                    </>
                  ) : (
                    t("weddingSettings.saveSettings")
                  )}
                </Button>
              </Stack>
            </Box>
          </LocalizationProvider>

          <Divider />

          {/* Wedding Information Display */}
          <CurrentWeddingInfo weddingDetails={weddingDetails} />
        </Stack>
      </Box>
    </Box>
  );
};

export default WeddingSettings;
