import React from "react";
import { Card, Box } from "@mui/material";
import { Wedding } from "../../api/wedding/weddingApi";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingInvitePhotoCardProps {
  weddingInfo: Wedding;
}

const WeddingInvitePhotoCard: React.FC<WeddingInvitePhotoCardProps> = ({
  weddingInfo,
}) => {
  const { t } = useTranslation();

  if (!weddingInfo.invitationPhoto) {
    return null;
  }

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
          display: "block",
        }}
      >
        <Box
          component="img"
          src={weddingInfo.invitationPhoto}
          alt={t("common.weddingInvitation")}
          sx={{
            width: "100%",
            maxHeight: "60vh",
            objectFit: "contain",
            display: "block",
          }}
        />
        {/* Fade overlay */}
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
      </Box>
    </Card>
  );
};

export default WeddingInvitePhotoCard;
