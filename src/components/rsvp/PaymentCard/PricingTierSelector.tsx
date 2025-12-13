import React from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import type { PricingTier } from "./PaymentCard.types";

interface PricingTierSelectorProps {
  tiers: PricingTier[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const PricingTierSelector: React.FC<PricingTierSelectorProps> = ({
  tiers,
  selectedIndex,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      {tiers.map((tier, index) => {
        const isSelected = selectedIndex === index;

        return (
          <Grid size={{ xs: 6, md: 3 }} key={tier.records}>
            <Box
              onClick={() => onSelect(index)}
              sx={{
                position: "relative",
                p: 2,
                borderRadius: 3,
                border: "2px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                backgroundColor: isSelected ? "primary.light" : "background.paper",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
                textAlign: "center",
                minHeight: 140,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {tier.isPopular && (
                <Chip
                  label={t("rsvp.premiumPricing.payment.mostPopular")}
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}

              <Typography
                variant="h4"
                fontWeight="bold"
                color={isSelected ? "primary.dark" : "text.primary"}
              >
                {tier.records}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {t("rsvp.premiumPricing.payment.records")}
              </Typography>

              <Typography
                variant="h6"
                fontWeight="600"
                color={isSelected ? "primary.dark" : "primary.main"}
              >
                ₪{tier.totalPrice}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                ₪{tier.pricePerRecord.toFixed(2)}/{t("rsvp.premiumPricing.payment.perRecord")}
              </Typography>

              {tier.savings > 0 && (
                <Chip
                  label={`${tier.savings}% ${t("rsvp.premiumPricing.payment.savings")}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{
                    mt: 1,
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              )}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PricingTierSelector;
