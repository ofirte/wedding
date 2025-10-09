import React from "react";
import { Box, Typography, Paper, Chip, useTheme } from "@mui/material";
import {
  Favorite as HeartIcon,
  DateRange as DateIcon,
} from "@mui/icons-material";
import { useWeddingDate } from "../../hooks/wedding/useWeddingDate";
import { useTranslation } from "../../localization/LocalizationContext";
import InvitationShareButton from "./InvitationShareButton";

interface WeddingCountdownBannerProps {}

const WeddingCountdownBanner: React.FC<WeddingCountdownBannerProps> = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const weddingDateInfo = useWeddingDate();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
        }}
      >
        <InvitationShareButton />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: 100,
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <HeartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{t("home.weddingCountdown")}</Typography>
        </Box>

        <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
          {weddingDateInfo?.daysRemaining || 0} {t("home.days")}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
          {t("home.untilSpecialDay")}
        </Typography>

        <Chip
          icon={<DateIcon />}
          label={weddingDateInfo?.weddingDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.9)",
            color: theme.palette.primary.dark,
            fontWeight: "medium",
            "& .MuiChip-icon": {
              color: theme.palette.primary.dark,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default WeddingCountdownBanner;
