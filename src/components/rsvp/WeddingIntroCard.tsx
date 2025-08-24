import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Link,
} from "@mui/material";
import {
  Favorite as HeartIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { Wedding } from "../../api/wedding/weddingApi";
import { Invitee } from "../invitees/InviteList";

interface WeddingIntroCardProps {
  weddingInfo: Wedding;
  guestInfo: Invitee;
}

const WeddingIntroCard: React.FC<WeddingIntroCardProps> = ({
  weddingInfo,
  guestInfo,
}) => {
  return (
    <Card
      elevation={6}
      sx={{
        mb: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
        direction: "rtl",
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
          {weddingInfo.brideName || "כלה"} & {weddingInfo.groomName || "חתן"}
        </Typography>

        <Typography
          variant="h5"
          sx={{ color: "#333333", mb: 1, fontWeight: 400 }}
        >
          {guestInfo.name}
        </Typography>

        <Typography variant="h6" sx={{ color: "#666666", mb: 1 }}>
          הנכם מוזמנים לחתונה שלנו! 💒
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 2 }}
        >
          <Chip
            icon={<DateIcon />}
            label={
              weddingInfo.date
                ? new Date(weddingInfo.date.seconds * 1000).toLocaleDateString(
                    "he-IL",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "TBD"
            }
            sx={{ bgcolor: "#D1E4C4", width: ({ spacing }) => spacing(24) }}
          />
          <Chip
            icon={<TimeIcon />}
            label="15:30"
            sx={{ bgcolor: "#D1E4C4", width: ({ spacing }) => spacing(12) }}
          />
          <Link
            href="https://www.goshvil.co.il/#shvil"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <Chip
              icon={<LocationIcon />}
              label={"שביל הגבעה"}
              sx={{
                bgcolor: "#D1E4C4",
                width: ({ spacing }) => spacing(18),
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#9BBB9B",
                  color: "white",
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                },
                transition: "all 0.3s ease",
              }}
            />
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeddingIntroCard;
