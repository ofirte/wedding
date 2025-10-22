import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useInvitees } from "../../../hooks/invitees/useInvitees";

interface SimpleRSVPDashboardProps {
  onBackToSetup: () => void;
}

/**
 * SimpleRSVPDashboard - User-friendly RSVP monitoring dashboard
 */
const SimpleRSVPDashboard: React.FC<SimpleRSVPDashboardProps> = ({
  onBackToSetup,
}) => {
  const { t } = useTranslation();
  const { data: invitees = [] } = useInvitees();

  // Calculate metrics - simplified for now
  const totalInvitees = invitees.length;
  const respondedCount = 0; // This would need to be calculated based on actual RSVP responses
  const responseRate =
    totalInvitees > 0 ? (respondedCount / totalInvitees) * 100 : 0;

  const statsCards = [
    {
      title: t("userRsvp.dashboard.totalInvitees"),
      value: totalInvitees,
      subtitle: t("userRsvp.dashboard.guestsInvited"),
      icon: <PeopleIcon />,
      color: "#2196F3",
    },
    {
      title: t("userRsvp.dashboard.responseRate"),
      value: `${Math.round(responseRate)}%`,
      subtitle: `${respondedCount} ${t("userRsvp.dashboard.responded")}`,
      icon: <CheckCircleIcon />,
      color: "#4CAF50",
    },
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          RSVP Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToSetup}
        >
          Back to Setup
        </Button>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
        gap={3}
        mb={4}
      >
        {statsCards.map((stat, index) => (
          <Card key={index} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: stat.color }}
                gutterBottom
              >
                {stat.value}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Alert severity="info">
        <Typography variant="body2">
          💡 Your RSVP system is active! Monitor responses and automation status
          here.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SimpleRSVPDashboard;
