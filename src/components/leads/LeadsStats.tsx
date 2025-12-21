import React from "react";
import { Box, Card, CardContent, Typography, Grid, Tooltip } from "@mui/material";
import { Lead } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  People,
  ContactPhone,
  TrendingUp,
  AttachMoney,
} from "@mui/icons-material";
import { LeadSourceColors } from "./leadsUtils";

interface LeadsStatsProps {
  leads: Lead[];
}

const LeadsStats: React.FC<LeadsStatsProps> = ({ leads }) => {
  const { t } = useTranslation();
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  const convertedLeads = leads.filter(
    (l) => l.status === "contract_signed" || l.status === "done"
  ).length;

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Payments received from signed/completed contracts
  const paymentsReceived = leads
    .filter((l) => l.status === "contract_signed" || l.status === "done")
    .reduce((sum, l) => sum + (l.advanceAmount || 0), 0);

  // Expected income from signed/completed contracts (remaining balance = quotation - paid so far)
  const expectedIncome = leads
    .filter((l) => l.status === "contract_signed" || l.status === "done")
    .reduce((sum, l) => sum + ((l.quotation || 0) - (l.advanceAmount || 0)), 0);

  // Count leads by source
  const sourceDistribution = leads.reduce((acc, lead) => {
    const source = lead.source || "other";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
      title: t("leads.stats.conversionRate"),
      value: `${conversionRate}%`,
      icon: <TrendingUp />,
      color: "#FF9800",
    },
    {
      title: t("leads.stats.paymentsReceived"),
      value: `₪${paymentsReceived.toLocaleString()}`,
      icon: <AttachMoney />,
      color: "#4CAF50",
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
    <Card sx={{ height: "100%", ...(stat.tooltip ? { cursor: "help" } : {}) }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
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
          <Typography variant="caption" color="text.secondary">
            {stat.title}
          </Typography>
        </Box>
        <Typography variant="h5" component="div">
          {stat.value}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSourceDiagram = () => {
    const sources = Object.entries(sourceDistribution).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...sources.map(([, count]) => count), 1);
    const maxHeight = 40;

    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            {t("leads.stats.sourceDistribution")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: maxHeight }}>
            {sources.map(([source, count]) => {
              const barHeight = Math.round((count / maxCount) * maxHeight);
              return (
                <Tooltip key={source} title={`${t(`leads.sources.${source}`)}: ${count}`} arrow>
                  <Box
                    sx={{
                      width: 12,
                      height: barHeight,
                      minHeight: 4,
                      backgroundColor: LeadSourceColors[source as keyof typeof LeadSourceColors] || "#9E9E9E",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid size={{
          xs: 12,
          sm: 6,
          md: 2,
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
      <Grid size={{
        xs: 12,
        sm: 6,
        md: 2,
      }}>
        {renderSourceDiagram()}
      </Grid>
    </Grid>
  );
};

export default LeadsStats;
