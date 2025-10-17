import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  Favorite as HeartIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { Wedding } from "@wedding-plan/types";
import { Invitee } from "../invitees/InviteList";
import { useTranslation } from "../../localization/LocalizationContext";

interface WeddingInfoCardProps {
  weddingInfo: Wedding;
  guestInfo: Invitee;
}

const WeddingInfoCard: React.FC<WeddingInfoCardProps> = ({
  weddingInfo,
  guestInfo,
}) => {
  const { t, language } = useTranslation();

  return (
    <Card
      elevation={6}
      sx={{
        mb: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
      }}
    >
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "#9BBB9B",
            mx: "auto",
            mb: 3,
          }}
        >
          <HeartIcon sx={{ fontSize: 40, color: "white" }} />
        </Avatar>

        <Typography
          variant="h3"
          sx={{ color: "#333333", mb: 2, fontWeight: 300 }}
        >
          {weddingInfo.brideName || t("common.bride")} &{" "}
          {weddingInfo.groomName || t("common.groom")}
        </Typography>

        <Typography
          variant="h5"
          sx={{ color: "#333333", mb: 1, fontWeight: 400 }}
        >
          {guestInfo.name}
        </Typography>

        <Typography variant="h6" sx={{ color: "#666666", mb: 1 }}>
          {t("common.weddingInvitation")}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 2 }}
        >
          {weddingInfo.date && (
            <Chip
              icon={<DateIcon />}
              label={weddingInfo.date.toLocaleDateString(
                language === "he" ? "he-IL" : "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
              sx={{
                bgcolor: "#D1E4C4",
                minWidth: "fit-content",
                padding: "0 30px",
                "& .MuiChip-label": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          )}
          {!!weddingInfo.startTime && (
            <Chip
              icon={<TimeIcon />}
              label={weddingInfo.startTime}
              sx={{
                bgcolor: "#D1E4C4",
                minWidth: "fit-content",
                padding: "0 30px",
                "& .MuiChip-label": {
                  whiteSpace: "nowrap",
                },
              }}
            />
          )}
          {!!weddingInfo.venueName && (
            <Chip
              icon={<LocationIcon />}
              label={weddingInfo.venueName}
              onClick={
                weddingInfo.venueLink
                  ? () => window.open(weddingInfo.venueLink, "_blank")
                  : undefined
              }
              sx={{
                bgcolor: "#D1E4C4",
                minWidth: "fit-content",
                cursor: weddingInfo.venueLink ? "pointer" : "default",
                padding: "0 30px",
                "& .MuiChip-label": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                ...(weddingInfo.venueLink && {
                  "&:hover": {
                    bgcolor: "#9BBB9B",
                    color: "white",
                    "& .MuiSvgIcon-root": {
                      color: "white",
                    },
                  },
                  transition: "all 0.3s ease",
                }),
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeddingInfoCard;
