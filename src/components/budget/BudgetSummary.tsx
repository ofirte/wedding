// BudgetSummary.tsx
import React from "react";
import { Box, Typography, Paper, Grid2 as Grid } from "@mui/material";

type SummaryProps = {
  totals: {
    expected: number;
    actual: number;
    downPayment: number;
    remaining: number;
  };
};

const BudgetSummary: React.FC<SummaryProps> = ({ totals }) => {
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
      color: "#f0e6ff",
    },
    {
      title: "Actual Total",
      value: formatCurrency(totals.actual),
      color: "#e6f4ff",
    },
    {
      title: "Paid So Far",
      value: formatCurrency(totals.downPayment),
      color: "#e6fff0",
    },
    {
      title: "Remaining Balance",
      value: formatCurrency(totals.remaining),
      color: "#fff8e6",
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
