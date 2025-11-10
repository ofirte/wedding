import React from "react";
import { Box, Typography, Button, Container, Stack, Paper } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useTranslation } from "../localization/LocalizationContext";
import { useParams, useNavigate } from "react-router";

const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (weddingId) {
      navigate(`/wedding/${weddingId}/rsvp`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Success Icon */}
            <CheckCircleIcon
              sx={{
                fontSize: 100,
                color: "success.main",
              }}
            />

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "primary.dark",
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              {t("payment.success.title")}
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                maxWidth: "400px",
              }}
            >
              {t("payment.success.subtitle")}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: "450px",
              }}
            >
              {t("payment.success.description")}
            </Typography>

            {/* CTA Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{
                mt: 2,
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {t("payment.success.continueButton")}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;
