import React from "react";
import { Box, Typography, Paper, Chip, useTheme } from "@mui/material";
import {
  Favorite as HeartIcon,
  DateRange as DateIcon,
} from "@mui/icons-material";
import { useWeddingDate } from "../../hooks/wedding/useWeddingDate";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

interface WeddingCountdownBannerProps {}

const WeddingCountdownBanner: React.FC<WeddingCountdownBannerProps> = ({}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
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
          bottom: -20,
          insetInlineEnd: -20,
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
          insetInlineEnd: 100,
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, textAlign: "start" }}>
        <Box display="flex" alignItems="center" mb={1}>
          <HeartIcon sx={{ marginInlineEnd: 1 }} />
          <Typography variant="h6">{t("countdown.title")}</Typography>
        </Box>

        <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
          {weddingDateInfo?.daysRemaining || 0} {t("countdown.days")}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
          {t("countdown.subtitle")}
        </Typography>

        <Chip
          icon={<DateIcon />}
          label={weddingDateInfo?.weddingDate.toLocaleDateString(
            language === "he" ? "he-IL" : "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.9)",
            color: theme.palette.primary.dark,
            fontWeight: "medium",
            "& .MuiChip-icon": {
              color: theme.palette.primary.dark,
              marginInlineEnd: -1,
              marginInlineStart: 1,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default WeddingCountdownBanner;
