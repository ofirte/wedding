// BudgetSummary.tsx
import React from "react";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import {
  TrendingUp as ExpectedIcon,
  MonetizationOn as ActualIcon,
  Payment as PaidIcon,
  AccountBalance as RemainingIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

type SummaryProps = {
  totals: {
    expected: number;
    actual: number;
    downPayment: number;
    remaining: number;
  };
  totalBudget?: number;
};

const BudgetSummary: React.FC<SummaryProps> = ({ totals, totalBudget = 0 }) => {
  const { t } = useTranslation();

  // Format currency
  const formatCurrency = (amount: number) => {
    return "₪" + amount.toLocaleString();
  };

  const summaryCards = [
    {
      title: t("budget.expectedTotal"),
      value: formatCurrency(totals.expected),
      icon: <ExpectedIcon sx={{ fontSize: 40, color: "info.main" }} />,
    },
    {
      title: t("budget.actualTotal"),
      value: formatCurrency(totals.actual),
      icon: <ActualIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: t("budget.paidSoFar"),
      value: formatCurrency(totals.downPayment),
      icon: <PaidIcon sx={{ fontSize: 40, color: "success.main" }} />,
    },
    {
      title: t("budget.remaining"),
      value: formatCurrency(totals.remaining),
      icon: <RemainingIcon sx={{ fontSize: 40, color: "warning.main" }} />,
    },
  ];

  return (
    <Grid container spacing={3} mb={2}>
      {summaryCards.map((card, index) => (
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
          key={index}
        >
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                {card.icon}
                <Typography variant="h5" component="div">
                  {card.value}
                </Typography>
                <Typography color="text.secondary">{card.title}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BudgetSummary;
