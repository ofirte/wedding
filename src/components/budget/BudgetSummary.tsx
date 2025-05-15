// BudgetSummary.tsx
import React from "react";
import { Typography, Paper, Grid2 as Grid, useTheme } from "@mui/material";

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
      title: "Expected Total",
      value: formatCurrency(totals.expected),
      color: theme.palette.info.light,
    },
    {
      title: "Actual Total",
      value: formatCurrency(totals.actual),
      color: theme.palette.primary.light,
    },
    {
      title: "Paid So Far",
      value: formatCurrency(totals.downPayment),
      color: theme.palette.success.light,
    },
    {
      title: "Remaining Budget",
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
