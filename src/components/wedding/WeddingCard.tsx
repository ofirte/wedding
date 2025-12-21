import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, differenceInDays } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Wedding } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingCardProps {
  wedding: Wedding;
  onSelect: (weddingId: string) => void;
  onDelete?: (wedding: Wedding) => void;
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
  onDelete,
  showCountdown = false,
}) => {
  const { t, language } = useTranslation();
  const dateLocale = language === "he" ? he : enUS;
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const daysLeft = wedding.date
    ? differenceInDays(new Date(wedding.date), new Date())
    : null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete?.(wedding);
  };

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {showCountdown && daysLeft !== null && daysLeft >= 0 && (
              <Chip
                label={t("weddings.daysLeft", { count: daysLeft })}
                color={getCountdownColor(daysLeft)}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            )}
            {onDelete && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  aria-label="more options"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={isMenuOpen}
                  onClose={() => handleMenuClose()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>{t("weddings.deleteWedding")}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
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
