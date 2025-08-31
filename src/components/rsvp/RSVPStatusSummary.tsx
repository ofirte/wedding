import React, { useMemo } from "react";
import { Box, Typography, Card, CardContent, Stack } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Hotel as HotelIcon,
  DirectionsBus as BusIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { Invitee } from "../invitees/InviteList";

type InviteeWithRSVP = Invitee & {
  rsvpStatus?: RSVPStatus;
};

interface RSVPStatusSummaryProps {
  inviteesWithRSVP: InviteeWithRSVP[];
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactElement;
  color?: string;
}> = ({ title, value, icon, color = "primary" }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const RSVPStatusSummary: React.FC<RSVPStatusSummaryProps> = ({
  inviteesWithRSVP,
}) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    let arrivingCount = 0;
    let notArrivingCount = 0;
    let sleepingCount = 0;
    let busCount = 0;

    inviteesWithRSVP.forEach((invitee) => {
      const status = invitee.rsvpStatus;

      // Only count submitted RSVPs
      if (status?.isSubmitted) {
        if (status?.attendance === true) {
          arrivingCount += status?.amount || 0;
          // Count sleepover requests for arriving guests
          if (status?.sleepover) {
            sleepingCount += status?.amount || 0;
          }
          // Count bus requests for arriving guests
          if (status?.rideFromTelAviv) {
            busCount += status?.amount || 0;
          }
        } else if (status?.attendance === false) {
          notArrivingCount += 1;
        }
      }
    });

    return {
      arrivingCount,
      notArrivingCount,
      sleepingCount,
      busCount,
    };
  }, [inviteesWithRSVP]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        {t("rsvpStatusTab.statistics")}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.arriving")}
            value={stats.arrivingCount}
            icon={<CheckIcon />}
            color="success"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.notArriving")}
            value={stats.notArrivingCount}
            icon={<CancelIcon />}
            color="error"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.sleepover")}
            value={stats.sleepingCount}
            icon={<HotelIcon />}
            color="warning"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.transportation")}
            value={stats.busCount}
            icon={<BusIcon />}
            color="info"
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default RSVPStatusSummary;
