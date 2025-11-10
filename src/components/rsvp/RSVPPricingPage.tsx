import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
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
  Upgrade as UpgradeIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

const RSVPPricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [guestCount, setGuestCount] = useState<string>("");

  // Flat-rate pricing logic based on guest count ranges
  const calculatePrice = (count: number): { price: number; rate: string } => {
    if (count < 50) return { price: 0, rate: "0" };
    if (count < 100) return { price: 150, rate: "1.5" };
    if (count < 150) return { price: 225, rate: "1.5-2.3" };
    if (count < 200) return { price: 300, rate: "1.5-2.0" };
    if (count < 250) return { price: 375, rate: "1.5-1.9" };
    if (count < 300) return { price: 450, rate: "1.5-1.8" };
    if (count < 350) return { price: 525, rate: "1.5-1.8" };
    if (count < 400) return { price: 600, rate: "1.5-1.7" };
    if (count < 450) return { price: 675, rate: "1.5-1.7" };
    if (count < 500) return { price: 750, rate: "1.5-1.7" };
    if (count < 550) return { price: 825, rate: "1.5-1.7" };
    if (count < 600) return { price: 900, rate: "1.5-1.6" };
    if (count < 650) return { price: 975, rate: "1.5-1.6" };
    if (count < 700) return { price: 1050, rate: "1.5-1.6" };
    if (count < 750) return { price: 1125, rate: "1.5-1.6" };
    if (count < 800) return { price: 1200, rate: "1.5-1.6" };
    if (count < 850) return { price: 1275, rate: "1.5-1.6" };
    if (count < 900) return { price: 1350, rate: "1.5-1.6" };
    if (count < 950) return { price: 1425, rate: "1.5-1.6" };
    if (count < 1000) return { price: 1500, rate: "1.5-1.6" };
    return { price: 0, rate: "0" }; // Contact for custom pricing
  };

  const pricing = calculatePrice(parseInt(guestCount) || 0);

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={8}>
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
        <Box>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
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
              "transportAndMeal",
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
        <Box>
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

          {/* Calculator and Examples */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Calculator Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={4}
                sx={{
                  height: "100%",
                  border: "3px solid",
                  borderColor: "primary.main",
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CalculateIcon
                        sx={{ fontSize: 32, color: "white" }}
                      />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="text.primary"
                      textAlign="center"
                    >
                      {t("rsvp.premiumPricing.pricing.calculator.title")}
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      label={t(
                        "rsvp.premiumPricing.pricing.calculator.inputLabel"
                      )}
                      placeholder={t(
                        "rsvp.premiumPricing.pricing.calculator.inputPlaceholder"
                      )}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">#</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "1.2rem",
                          fontWeight: "600",
                        },
                      }}
                    />

                    {parseInt(guestCount) >= 50 && pricing.price > 0 ? (
                      <Box
                        sx={{
                          width: "100%",
                          textAlign: "center",
                          py: 3,
                          px: 2,
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                          {t("rsvp.premiumPricing.pricing.calculator.priceLabel")}
                        </Typography>
                        <Typography
                          variant="h2"
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          ₪{pricing.price}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          ({pricing.rate} ₪{" "}
                          {t("rsvp.premiumPricing.pricing.perInvitee")})
                        </Typography>
                      </Box>
                    ) : parseInt(guestCount) > 0 && parseInt(guestCount) < 50 ? (
                      <Typography
                        variant="body1"
                        color="warning.main"
                        textAlign="center"
                      >
                        {t("rsvp.premiumPricing.pricing.calculator.minRecords")}
                      </Typography>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Examples Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "2px solid",
                  borderColor: "divider",
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="text.primary"
                    textAlign="center"
                    gutterBottom
                    sx={{ mb: 4 }}
                  >
                    {t(
                      "rsvp.premiumPricing.pricing.calculator.examplesTitle"
                    )}
                  </Typography>
                  <Stack spacing={3}>
                    {/* Example 1 */}
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: "primary.light",
                        background: "rgba(102, 126, 234, 0.05)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {t(
                              "rsvp.premiumPricing.pricing.calculator.example1"
                            )}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {t(
                              "rsvp.premiumPricing.pricing.calculator.example1Rate"
                            )}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {t(
                            "rsvp.premiumPricing.pricing.calculator.example1Price"
                          )}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Example 2 */}
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: "secondary.light",
                        background: "rgba(118, 75, 162, 0.05)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {t(
                              "rsvp.premiumPricing.pricing.calculator.example2"
                            )}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {t(
                              "rsvp.premiumPricing.pricing.calculator.example2Rate"
                            )}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="secondary.main"
                        >
                          {t(
                            "rsvp.premiumPricing.pricing.calculator.example2Price"
                          )}
                        </Typography>
                      </Stack>
                    </Box>

                    <Divider />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ fontStyle: "italic" }}
                    >
                      {t("rsvp.premiumPricing.pricing.customPricing")}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box>
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

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "inherit" }}
          >
            {t("rsvp.premiumPricing.cta.title")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: "auto",
              color: "inherit",
              opacity: 0.9,
            }}
          >
            {t("rsvp.premiumPricing.cta.description")}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<UpgradeIcon />}
              sx={{
                py: 2,
                px: 4,
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              {t("rsvp.premiumPricing.cta.upgradeButton")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                px: 4,
                fontSize: "1rem",
                fontWeight: "500",
                borderRadius: 3,
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.5)",
                color: "inherit",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {t("rsvp.premiumPricing.cta.contactUs")}
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {t("rsvp.premiumPricing.cta.guarantee")}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default RSVPPricingPage;
