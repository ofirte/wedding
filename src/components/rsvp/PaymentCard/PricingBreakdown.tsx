import React from "react";
import { Box, Typography, Divider, Stack } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import type { PricingBreakdownData } from "./PaymentCard.types";

interface PricingBreakdownProps {
  pricing: PricingBreakdownData | null;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ pricing }) => {
  const { t } = useTranslation();

  if (!pricing) {
    return null;
  }

  return (
    <Box
      sx={{
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5}>
        {/* Base price line */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {pricing.recordCount.toLocaleString()}{" "}
            {t("rsvp.premiumPricing.payment.records")} × ₪
            {pricing.pricePerRecord}/
            {t("rsvp.premiumPricing.payment.perRecord")}
          </Typography>
          <Typography variant="body2" color="text.primary">
            ₪{pricing.totalPrice}
          </Typography>
        </Box>

        <Divider />

        {/* Total line */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            {t("rsvp.premiumPricing.payment.total")}
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary.dark"
          >
            ₪{pricing.totalPrice}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default PricingBreakdown;
