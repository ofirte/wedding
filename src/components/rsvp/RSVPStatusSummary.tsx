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
  onFilterClick?: (filterType: string, value: any) => void;
  activeFilter?: { type: string; value: any } | null;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactElement;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ title, value, icon, color = "primary", onClick, isActive = false }) => (
  <Card 
    sx={{ 
      height: "100%",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      border: isActive ? 2 : 1,
      borderColor: isActive ? `${color}.main` : "divider",
      bgcolor: isActive ? `${color}.50` : "background.paper",
      boxShadow: isActive ? 3 : 1,
      "&:hover": onClick ? {
        transform: "translateY(-2px)",
        boxShadow: isActive ? 4 : 2,
        borderColor: `${color}.main`,
      } : {}
    }}
    onClick={onClick}
  >
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
            bgcolor: isActive ? `${color}.main` : `${color}.light`,
            color: isActive ? "white" : `${color}.main`,
            boxShadow: isActive ? 2 : 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color={isActive ? `${color}.main` : color}
            sx={{ 
              textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.1)" : "none" 
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const RSVPStatusSummary: React.FC<RSVPStatusSummaryProps> = ({
  inviteesWithRSVP,
  onFilterClick,
  activeFilter,
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
            onClick={() => onFilterClick?.("attendance", true)}
            isActive={activeFilter?.type === "attendance" && activeFilter?.value === true}
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.notArriving")}
            value={stats.notArrivingCount}
            icon={<CancelIcon />}
            color="error"
            onClick={() => onFilterClick?.("attendance", false)}
            isActive={activeFilter?.type === "attendance" && activeFilter?.value === false}
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.sleepover")}
            value={stats.sleepingCount}
            icon={<HotelIcon />}
            color="warning"
            onClick={() => onFilterClick?.("sleepover", true)}
            isActive={activeFilter?.type === "sleepover" && activeFilter?.value === true}
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <StatCard
            title={t("rsvpStatusTab.transportation")}
            value={stats.busCount}
            icon={<BusIcon />}
            color="info"
            onClick={() => onFilterClick?.("ride", true)}
            isActive={activeFilter?.type === "ride" && activeFilter?.value === true}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default RSVPStatusSummary;
