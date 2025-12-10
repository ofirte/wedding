import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { format, differenceInDays } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Wedding } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingCardProps {
  wedding: Wedding;
  onSelect: (weddingId: string) => void;
  showCountdown?: boolean;
}

const getCountdownColor = (
  daysLeft: number
): "error" | "warning" | "primary" => {
  if (daysLeft <= 30) return "error";
  if (daysLeft <= 90) return "warning";
  return "primary";
};

const WeddingCard: React.FC<WeddingCardProps> = ({
  wedding,
  onSelect,
  showCountdown = false,
}) => {
  const { t, language } = useTranslation();
  const dateLocale = language === "he" ? he : enUS;

  const daysLeft = wedding.date
    ? differenceInDays(new Date(wedding.date), new Date())
    : null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
      onClick={() => onSelect(wedding.id)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
            {wedding.name}
          </Typography>
          {showCountdown && daysLeft !== null && daysLeft >= 0 && (
            <Chip
              label={t("weddings.daysLeft", { count: daysLeft })}
              color={getCountdownColor(daysLeft)}
              size="small"
              sx={{ ml: 1, fontWeight: "bold" }}
            />
          )}
        </Box>

        {wedding.date && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
             📅 {format(new Date(wedding.date), "PPP", { locale: dateLocale })}
          </Typography>
        )}

        {wedding.venueName && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📍 {wedding.venueName}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onSelect(wedding.id);
          }}
        >
          {t("weddings.openWedding")}
        </Button>
      </CardActions>
    </Card>
  );
};

export default WeddingCard;
