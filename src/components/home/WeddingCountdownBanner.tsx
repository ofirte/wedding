import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, useTheme } from "@mui/material";
import {
  Favorite as HeartIcon,
  DateRange as DateIcon,
} from "@mui/icons-material";

interface WeddingCountdownBannerProps {
  weddingDate: Date;
}

const WeddingCountdownBanner: React.FC<WeddingCountdownBannerProps> = ({
  weddingDate,
}) => {
  const theme = useTheme();

  // Calculate days remaining until wedding
  const calculateDaysRemaining = (): number => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [daysRemaining, setDaysRemaining] = useState<number>(
    calculateDaysRemaining()
  );

  // Update days remaining when the component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setDaysRemaining(calculateDaysRemaining());
    }, 86400000); // Update every 24 hours

    return () => clearInterval(timer);
  }, [weddingDate]);

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
          <Typography variant="h6">Wedding Countdown</Typography>
        </Box>

        <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
          {daysRemaining} Days
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
          until your special day
        </Typography>

        <Chip
          icon={<DateIcon />}
          label={weddingDate.toLocaleDateString("en-US", {
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
