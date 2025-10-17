import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { Wedding } from "@wedding-plan/types";
import { Invitee } from "../invitees/InviteList";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import { useTranslation } from "../../localization/LocalizationContext";

interface ThankYouCardProps {
  rsvpData: Partial<InviteeRSVP>;
  weddingInfo: Wedding;
  guestInfo: Invitee;
  onUpdateInfo: () => void;
}

const ThankYouCard: React.FC<ThankYouCardProps> = ({
  rsvpData,
  weddingInfo,
  guestInfo,
  onUpdateInfo,
}) => {
  const { t } = useTranslation();
  // Extract the two mandatory fields
  const isAttending = rsvpData.attendance === true;
  const guestCount = (() => {
    const amount = rsvpData.amount;
    if (typeof amount === "number") return amount;
    if (typeof amount === "string") {
      const parsed = parseInt(amount);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  })();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF8E7, #D1E4C4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
            direction: "rtl",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#9BBB9B",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: "white" }} />
          </Avatar>

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#333333", mb: 2 }}
          >
            {t("thankYou.thankYouTitle", { guestName: guestInfo.name })}
          </Typography>

          <Typography variant="h6" sx={{ color: "#666666", mb: 3 }}>
            {t("thankYou.rsvpSentSuccessfully")}
          </Typography>

          <Typography variant="body1" sx={{ color: "#666666", mb: 4 }}>
            {isAttending
              ? t("thankYou.excitedToCelebrate", {
                  weddingDate: weddingInfo.date
                    ? weddingInfo.date.toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "Asia/Jerusalem",
                      })
                    : "",
                  guestCount:
                    guestCount > 1
                      ? `(${guestCount} ${t("common.guests")})`
                      : "",
                })
              : t("thankYou.sorryYouCantAttend", {
                  weddingDate: weddingInfo.date
                    ? weddingInfo.date.toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "Asia/Jerusalem",
                      })
                    : "",
                })}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ color: "#666666", mb: 2 }}>
            {t("thankYou.canUpdateAnytime")}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: "#9BBB9B", color: "white" }}
            onClick={onUpdateInfo}
          >
            {t("thankYou.updateRsvp")}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ThankYouCard;
