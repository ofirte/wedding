import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { usePaymentCardLogic } from "./usePaymentCardLogic";
import PricingTierSelector from "./PricingTierSelector";
import CustomQuantityInput from "./CustomQuantityInput";
import PricingBreakdown from "./PricingBreakdown";
import type { PaymentCardProps } from "./PaymentCard.types";

const PaymentCard: React.FC<PaymentCardProps> = ({
  weddingId,
  onPaymentInitiated,
  onPaymentError,
}) => {
  const { t } = useTranslation();

  const {
    selectedTierIndex,
    customQuantity,
    isCustomMode,
    isProcessing,
    error,
    presetTiers,
    currentPricing,
    isValid,
    setSelectedTierIndex,
    setCustomQuantity,
    setIsCustomMode,
    incrementQuantity,
    decrementQuantity,
    handlePayment,
    clearError,
  } = usePaymentCardLogic(weddingId, onPaymentInitiated, onPaymentError);

  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: boolean | null
  ) => {
    if (newMode !== null) {
      setIsCustomMode(newMode);
      clearError();
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        maxWidth: '80%',
        mx: "auto",
        borderRadius: 4,
        border: "3px solid",
        borderColor: "primary.main",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {t("rsvp.premiumPricing.payment.chooseYourPlan")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("rsvp.premiumPricing.payment.subtitle")}
            </Typography>
          </Box>

          {/* Mode Toggle */}
          <Box display="flex" justifyContent="center">
            <ToggleButtonGroup
              value={isCustomMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                },
              }}
            >
              <ToggleButton value={false}>
                {t("rsvp.premiumPricing.payment.presetOptions")}
              </ToggleButton>
              <ToggleButton value={true}>
                {t("rsvp.premiumPricing.payment.customAmount")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Tier Selection or Custom Input */}
          {isCustomMode ? (
            <CustomQuantityInput
              value={customQuantity}
              onChange={setCustomQuantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />
          ) : (
            <PricingTierSelector
              tiers={presetTiers}
              selectedIndex={selectedTierIndex}
              onSelect={setSelectedTierIndex}
            />
          )}

          {/* Pricing Breakdown */}
          <PricingBreakdown pricing={currentPricing} />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* CTA Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handlePayment}
            disabled={!isValid || isProcessing}
            startIcon={
              isProcessing ? (
                <CircularProgress size={20} sx={{ color: "inherit" }} />
              ) : (
                <LockIcon />
              )
            }
            sx={{
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              "&:disabled": {
                opacity: 0.6,
              },
            }}
          >
            {isProcessing
              ? t("rsvp.premiumPricing.payment.processing")
              : t("rsvp.premiumPricing.payment.proceedToPayment")}
          </Button>

          {/* Security Note */}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            sx={{ opacity: 0.8 }}
          >
            {t("rsvp.premiumPricing.cta.guarantee")}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
