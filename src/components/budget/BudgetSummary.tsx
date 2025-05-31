// BudgetSummary.tsx
import React from "react";
import { Typography, Paper,  Grid, useTheme } from "@mui/material";
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
  // Access theme
  const theme = useTheme();
  const { t } = useTranslation();
  // Format currency
  const formatCurrency = (amount: number) => {
    return "₪" + amount.toLocaleString();
  };

  const SummaryCard = ({ title, value, color }: any) => {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          textAlign: "center",
          backgroundColor: color,
          padding: 4,
          maxHeight: 100,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Paper>
    );
  };

  const summaryCards = [
    {
      title: t("budget.expectedTotal"),
      value: formatCurrency(totals.expected),
      color: theme.palette.info.light,
    },
    {
      title: t("budget.actualTotal"),
      value: formatCurrency(totals.actual),
      color: theme.palette.primary.light,
    },
    {
      title: t("budget.paidSoFar"),
      value: formatCurrency(totals.downPayment),
      color: theme.palette.success.light,
    },
    {
      title: t("budget.remaining"),
      value: formatCurrency(totalBudget - totals.actual),
      color: theme.palette.warning.light,
    },
  ];

  return (
    <Grid container spacing={2} mb={2}>
      {summaryCards.map((card, index) => (
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
          key={index}
        >
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BudgetSummary;
