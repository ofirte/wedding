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
import { RSVPFormData } from "./guestRSVPTypes";
import { Wedding } from "../../api/wedding/weddingApi";
import { Invitee } from "../invitees/InviteList";

interface ThankYouCardProps {
  formData: RSVPFormData;
  weddingInfo: Wedding;
  guestInfo: Invitee;
  onUpdateInfo: () => void;
}

const ThankYouCard: React.FC<ThankYouCardProps> = ({
  formData,
  weddingInfo,
  guestInfo,
  onUpdateInfo,
}) => {
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
            תודה רבה, {guestInfo.name}! 🎉
          </Typography>

          <Typography variant="h6" sx={{ color: "#666666", mb: 3 }}>
            אישור ההגעה שלכם נשלח בהצלחה
          </Typography>

          <Typography variant="body1" sx={{ color: "#666666", mb: 4 }}>
            {formData.attending === "yes"
              ? `אנחנו מתרגשים לחגוג איתכם ${
                  weddingInfo.date
                    ? `ב${new Date(
                        weddingInfo.date.seconds * 1000
                      ).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : ""
                }! 💒`
              : `אנחנו מצטערים שלא תוכלו להגיע ליום המיוחד שלנו${
                  weddingInfo.date
                    ? ` ב${new Date(
                        weddingInfo.date.seconds * 1000
                      ).toLocaleDateString("he-IL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : ""
                }, אבל תודה שהודעתם לנו.`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ color: "#666666", mb: 2 }}>
            תוכלו לעדכן את אישור ההגעה שלכם בכל זמן דרך הקישור שקיבלתם 💌
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: "#9BBB9B", color: "white" }}
            onClick={onUpdateInfo}
          >
            עדכון אישור הגעה
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ThankYouCard;
