import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Wedding } from "../../api/wedding/weddingApi";
import { useTranslation } from "../../localization/LocalizationContext";

interface CurrentWeddingInfoProps {
  weddingDetails: Wedding;
}

const CurrentWeddingInfo: React.FC<CurrentWeddingInfoProps> = ({
  weddingDetails,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("weddingSettings.currentWeddingInfo")}
      </Typography>
      <Stack spacing={1} sx={{ color: "text.secondary" }}>
        <Typography variant="body2">
          <strong>{t("weddingSettings.weddingId")}:</strong> {weddingDetails.id}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.created")}:</strong>{" "}
          {weddingDetails.createdAt
            ? new Date(weddingDetails.createdAt).toLocaleDateString()
            : t("common.notAvailable")}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.startTime")}:</strong>{" "}
          {weddingDetails.startTime || t("weddingSettings.notSet")}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.venueName")}:</strong>{" "}
          {weddingDetails.venueName ? (
            weddingDetails.venueLink ? (
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  textDecoration: "underline",
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
                onClick={() => window.open(weddingDetails.venueLink, "_blank")}
              >
                {weddingDetails.venueName}
              </Box>
            ) : (
              weddingDetails.venueName
            )
          ) : (
            t("weddingSettings.notSet")
          )}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.invitationPhoto")}:</strong>{" "}
          {weddingDetails.invitationPhoto
            ? t("weddingSettings.uploaded")
            : t("weddingSettings.notUploaded")}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.invitationCode")}:</strong>{" "}
          {weddingDetails.invitationCode || t("weddingSettings.notGenerated")}
        </Typography>
        <Typography variant="body2">
          <strong>{t("weddingSettings.users")}:</strong>{" "}
          {weddingDetails.userIds?.length || 0} {t("weddingSettings.members")}
        </Typography>
      </Stack>
    </Box>
  );
};

export default CurrentWeddingInfo;
