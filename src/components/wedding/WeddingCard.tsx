import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { Wedding } from "../../api/wedding/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingCardProps {
  wedding: Wedding;
  onSelect: (weddingId: string) => void;
}

const WeddingCard: React.FC<WeddingCardProps> = ({ wedding, onSelect }) => {
  const { t } = useTranslation();

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
        <Typography variant="h6" component="h3" gutterBottom>
          {wedding.name}
        </Typography>

        {(wedding.brideName || wedding.groomName) && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {[wedding.brideName, wedding.groomName].filter(Boolean).join(" & ")}
          </Typography>
        )}

        {wedding.date && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📅 {format(new Date(wedding.date), "PPP")}
          </Typography>
        )}

        {wedding.venueName && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📍 {wedding.venueName}
          </Typography>
        )}

        {wedding.invitationCode && (
          <Typography variant="caption" color="text.secondary">
            {t("weddings.invitationCode")}: {wedding.invitationCode}
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
