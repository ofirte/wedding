import React from "react";
import {
  Box,
  Typography,
  Container,
  Stack,
  Card,
  CardContent,
  Grid,
  Avatar,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Message as MessageIcon,
  AutoAwesome as AutomationIcon,
  WhatsApp as WhatsAppIcon,
  CalendarMonth as CalendarIcon,
  CardGiftcard as GiftIcon,
  Favorite as HeartIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useParams } from "react-router";
import { PaymentCard } from "./PaymentCard";

const RSVPPricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { weddingId } = useParams<string>();

  const getStepIcon = (iconName: string) => {
    const icons = {
      settings: <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      message: <MessageIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      automation: (
        <AutomationIcon sx={{ fontSize: 40, color: "success.main" }} />
      ),
    };
    return icons[iconName as keyof typeof icons] || icons.settings;
  };

  const getFeatureIcon = (iconName: string) => {
    const icons = {
      message: <WhatsAppIcon sx={{ fontSize: 32, color: "primary.main" }} />,
      calendar: <CalendarIcon sx={{ fontSize: 32, color: "warning.main" }} />,
      gift: <GiftIcon sx={{ fontSize: 32, color: "secondary.main" }} />,
      heart: <HeartIcon sx={{ fontSize: 32, color: "error.main" }} />,
      phone: <PhoneIcon sx={{ fontSize: 32, color: "info.main" }} />,
      settings: <SettingsIcon sx={{ fontSize: 32, color: "primary.main" }} />,
      automation: (
        <AutomationIcon sx={{ fontSize: 32, color: "success.main" }} />
      ),
    };
    return icons[iconName as keyof typeof icons] || icons.message;
  };

  return (
    <Container maxWidth="lg">
      <Stack>
        {/* Hero Section */}
        <Box textAlign="center" sx={{ py: { xs: 4, md: 8 } }}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            color="primary.main"
            gutterBottom
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("rsvp.premiumPricing.hero.title")}
          </Typography>
          <Typography
            variant="h4"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 3 }}
          >
            {t("rsvp.premiumPricing.hero.subtitle")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: "auto", mb: 4 }}
          >
            {t("rsvp.premiumPricing.hero.description")}
          </Typography>
        </Box>

        {/* How It Works Section */}
        <Box>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            {t("rsvp.premiumPricing.howItWorks.title")}
          </Typography>
          <Grid container spacing={4}>
            {["step1", "step2", "step3"].map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={step}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "2px solid",
                    borderColor: "divider",
                    borderRadius: 4,
                    textAlign: "center",
                    p: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.2)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        border: "3px solid",
                        borderColor: "primary.light",
                      }}
                    >
                      {getStepIcon(
                        t(`rsvp.premiumPricing.howItWorks.${step}.icon`)
                      )}
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      color="text.primary"
                      gutterBottom
                    >
                      {`${index + 1}. ${t(
                        `rsvp.premiumPricing.howItWorks.${step}.title`
                      )}`}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t(`rsvp.premiumPricing.howItWorks.${step}.description`)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mt: 12 }}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            {t("rsvp.premiumPricing.features.title")}
          </Typography>
          <Grid container spacing={4}>
            {[
              "rsvpMessages",
              "phoneSupport",
              "eventReminder",
              "thankYou",
              "customDesign",
              "transportation",
              "mealPreferences",
              "customMessages",
              "smartTracking",
            ].map((feature) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feature}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          minWidth: 56,
                          height: 56,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getFeatureIcon(
                          t(`rsvp.premiumPricing.features.${feature}.icon`)
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="text.primary"
                          gutterBottom
                        >
                          {t(`rsvp.premiumPricing.features.${feature}.title`)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(
                            `rsvp.premiumPricing.features.${feature}.description`
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing Section */}
        <Box
          sx={{
            px: ({ spacing }) => spacing(16),
            mt: 3,
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            {t("rsvp.premiumPricing.pricing.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 2 }}
          >
            {t("rsvp.premiumPricing.pricing.subtitle")}
          </Typography>
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {t("rsvp.premiumPricing.pricing.startingPrice")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("rsvp.premiumPricing.pricing.perInvitee")}
            </Typography>
          </Box>

          {/* Payment Card */}
          <PaymentCard weddingId={weddingId || ""} />
        </Box>

        {/* Testimonials Section */}
        <Box
          sx={{
            mt: 3,
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            {t("rsvp.premiumPricing.testimonials.title")}
          </Typography>
          <Grid container spacing={4}>
            {["testimonial1", "testimonial2"].map((testimonial) => (
              <Grid size={{ xs: 12, md: 6 }} key={testimonial}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "2px solid",
                    borderColor: "divider",
                    borderRadius: 4,
                    p: 3,
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: "italic",
                        mb: 3,
                        lineHeight: 1.7,
                      }}
                    >
                      "
                      {t(
                        `rsvp.premiumPricing.testimonials.${testimonial}.text`
                      )}
                      "
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <HeartIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {t(
                            `rsvp.premiumPricing.testimonials.${testimonial}.author`
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(
                            `rsvp.premiumPricing.testimonials.${testimonial}.wedding`
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
};

export default RSVPPricingPage;
