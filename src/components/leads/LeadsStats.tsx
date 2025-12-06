import React from "react";
import { Box, Card, CardContent, Typography, Grid, Tooltip } from "@mui/material";
import { Lead } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  People,
  ContactPhone,
  CheckCircle,
  TrendingUp,
  AttachMoney,
} from "@mui/icons-material";

interface LeadsStatsProps {
  leads: Lead[];
}

const LeadsStats: React.FC<LeadsStatsProps> = ({ leads }) => {
  const { t } = useTranslation();
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  // Count all successfully converted leads (contract signed and beyond)
  const convertedLeads = leads.filter(
    (l) => l.status === "contract_signed" || l.status === "done"
  ).length;

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Expected income from signed contracts (remaining balance = quotation - advance paid)
  const expectedIncome = leads
    .filter((l) => l.status === "contract_signed" && l.paymentStatus !== "paid_in_full")
    .reduce((sum, l) => sum + ((l.quotation || 0) - (l.advanceAmount || 0)), 0);

  const stats = [
    {
      title: t("leads.stats.totalLeads"),
      value: totalLeads,
      icon: <People />,
      color: "#2196F3",
    },
    {
      title: t("leads.stats.newLeads"),
      value: newLeads,
      icon: <ContactPhone />,
      color: "#9E9E9E",
    },
    {
      title: t("leads.stats.converted"),
      value: convertedLeads,
      icon: <CheckCircle />,
      color: "#4CAF50",
    },
    {
      title: t("leads.stats.conversionRate"),
      value: `${conversionRate}%`,
      icon: <TrendingUp />,
      color: "#FF9800",
    },
    {
      title: t("leads.stats.expectedIncome"),
      value: `₪${expectedIncome.toLocaleString()}`,
      icon: <AttachMoney />,
      color: "#2E7D32",
      tooltip: t("leads.stats.expectedIncomeTooltip"),
    },
  ];

  const renderCard = (stat: typeof stats[0]) => (
    <Card sx={stat.tooltip ? { cursor: "help" } : undefined}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              color: stat.color,
              display: "flex",
              mr: 1,
            }}
          >
            {stat.icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {stat.title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {stat.value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid size={{
          xs: 12,
          sm: 6,
          md: 2.4,
        }} key={index}>
          {stat.tooltip ? (
            <Tooltip title={stat.tooltip} arrow>
              {renderCard(stat)}
            </Tooltip>
          ) : (
            renderCard(stat)
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default LeadsStats;
