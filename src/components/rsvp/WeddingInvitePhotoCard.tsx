import React, { useState } from "react";
import { Card, Box, CircularProgress } from "@mui/material";
import { Wedding } from "../../api/wedding/weddingApi";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingInvitePhotoCardProps {
  weddingInfo: Wedding;
}

const WeddingInvitePhotoCard: React.FC<WeddingInvitePhotoCardProps> = ({
  weddingInfo,
}) => {
  const { t } = useTranslation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!weddingInfo.invitationPhoto) {
    return null;
  }

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Card
      elevation={6}
      sx={{
        mb: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
        overflow: "hidden",
        maxWidth: ({ spacing }) => spacing(200),
        mx: "auto",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          maxHeight: "60vh",
        }}
      >
        {/* Loading indicator */}
        {imageLoading && (
          <Box
            sx={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              zIndex: 2,
            }}
          >
            <CircularProgress
              sx={{
                color: "#9BBB9B",
              }}
            />
          </Box>
        )}

        {!imageError && (
          <Box
            component="img"
            src={weddingInfo.invitationPhoto}
            alt={t("common.weddingInvitation")}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              width: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              display: "block",
              opacity: imageLoading ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* Fade overlay - only show when image is loaded */}
        {!imageLoading && !imageError && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(to right, 
                  rgba(255, 255, 255, 0.8) 0%,
                  rgba(255, 255, 255, 0.4) 15%,
                  transparent 30%, 
                  transparent 70%, 
                  rgba(255, 248, 231, 0.4) 85%,
                  rgba(255, 248, 231, 0.8) 100%)
              `,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Error state */}
        {imageError && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "0.9rem",
              textAlign: "center",
              p: 2,
            }}
          >
            {t("common.error")}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default WeddingInvitePhotoCard;
