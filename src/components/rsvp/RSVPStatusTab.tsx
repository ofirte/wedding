import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Group as GroupIcon,
  Hotel as HotelIcon,
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import { useRSVPStatuses } from "../../hooks/rsvp/useRSVPStatuses";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { Invitee } from "../invitees/InviteList";
import DSTable, { Column } from "../common/DSTable";
import { isNil } from "lodash";
import { useTranslation } from "../../localization/LocalizationContext";

type InviteeWithRSVP = Invitee & {
  rsvpStatus?: RSVPStatus;
};

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

const RSVPStatusTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: rsvpStatuses, isLoading: isLoadingRSVP } = useRSVPStatuses();
  const { data: invitees, isLoading: isLoadingInvitees } = useInvitees();

  const inviteesWithRSVP: InviteeWithRSVP[] = useMemo(() => {
    if (!invitees || !rsvpStatuses) return [];
    return invitees.map((invitee) => ({
      ...invitee,
      rsvpStatus: rsvpStatuses[invitee.id],
    }));
  }, [invitees, rsvpStatuses]);

  const stats = useMemo(() => {
    let submittedCount = 0;
    let attendingCount = 0;
    let totalGuests = 0;
    let sleepoverCount = 0;
    let rideCount = 0;

    inviteesWithRSVP.forEach((invitee) => {
      const status = invitee.rsvpStatus;
      if (status?.isSubmitted) {
        submittedCount++;
      }
      if (status?.attendance) {
        attendingCount += status?.amount || 0;
        totalGuests += status?.amount || 0;
        if (status?.sleepover) sleepoverCount += status?.amount || 0;
        if (status?.rideFromTelAviv) rideCount += status?.amount || 0;
      }
    });

    return {
      submittedCount,
      attendingCount,
      totalGuests,
      sleepoverCount,
      rideCount,
      totalInvitees: inviteesWithRSVP.length,
    };
  }, [inviteesWithRSVP]);

  const columns: Column<InviteeWithRSVP>[] = [
    {
      id: "name",
      label: t("rsvpStatusTab.name"),
      render: (row) => (
        <Typography variant="body2" fontWeight="medium">
          {row.name}
        </Typography>
      ),
      sortable: true,
    },
    {
      id: "phone",
      label: t("rsvpStatusTab.phone"),
      sortable: true,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.cellphone || "-"}
        </Typography>
      ),
    },
    {
      id: "attendance",
      label: t("rsvpStatusTab.attendance"),
      sortable: true,
      sortFn: (a, b) => {
        const aAttendance = a.rsvpStatus?.attendance;
        const bAttendance = b.rsvpStatus?.attendance;

        // Sort priority: attending -> not attending -> pending
        if (aAttendance === bAttendance) return 0;
        if (aAttendance === true && bAttendance !== true) return -1;
        if (bAttendance === true && aAttendance !== true) return 1;
        if (aAttendance === false && isNil(bAttendance)) return -1;
        if (bAttendance === false && isNil(aAttendance)) return 1;
        return 0;
      },
      render: (row) => {
        const status = row.rsvpStatus;
        if (isNil(status?.attendance)) {
          return (
            <Chip
              icon={<PendingIcon />}
              label={t("rsvpStatusTab.pending")}
              size="small"
              color="default"
              variant="outlined"
            />
          );
        }
        if (status?.attendance) {
          return (
            <Chip
              icon={<CheckIcon />}
              label={t("rsvpStatusTab.arriving")}
              size="small"
              color="success"
            />
          );
        }
        return (
          <Chip
            icon={<CancelIcon />}
            label={t("rsvpStatusTab.notArriving")}
            size="small"
            color="error"
          />
        );
      },
    },
    {
      id: "guestCount",
      label: t("rsvpStatusTab.guestCount"),
      render: (row) => {
        const status = row.rsvpStatus;
        if (isNil(status?.amount)) return "-";
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <GroupIcon fontSize="small" color="action" />
            <Typography variant="body2">{status?.amount || 0}</Typography>
          </Box>
        );
      },
      sortable: true,
      sortFn: (a, b) => {
        const aCount = a.rsvpStatus?.amount || 0;
        const bCount = b.rsvpStatus?.amount || 0;
        return aCount - bCount;
      },
    },
    {
      id: "sleepover",
      label: t("rsvpStatusTab.sleepoverColumn"),
      sortable: true,
      sortFn: (a, b) => {
        const aSleepover = a.rsvpStatus?.sleepover;
        const bSleepover = b.rsvpStatus?.sleepover;

        // Sort priority: true -> false -> null/undefined
        if (aSleepover === bSleepover) return 0;
        if (aSleepover === true && bSleepover !== true) return -1;
        if (bSleepover === true && aSleepover !== true) return 1;
        if (aSleepover === false && bSleepover === null) return -1;
        if (bSleepover === false && aSleepover === null) return 1;
        return 0;
      },
      render: (row) => {
        const status = row.rsvpStatus;
        if (isNil(status?.sleepover)) return "-";
        return status?.sleepover ? (
          <HotelIcon color="primary" fontSize="small" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("rsvpStatusTab.noData")}
          </Typography>
        );
      },
    },
    {
      id: "ride",
      label: t("rsvpStatusTab.transportationColumn"),
      sortable: true,
      sortFn: (a, b) => {
        const aRide = a.rsvpStatus?.rideFromTelAviv;
        const bRide = b.rsvpStatus?.rideFromTelAviv;

        // Sort priority: true -> false -> null/undefined
        if (aRide === bRide) return 0;
        if (aRide === true && bRide !== true) return -1;
        if (bRide === true && aRide !== true) return 1;
        if (aRide === false && bRide === null) return -1;
        if (bRide === false && aRide === null) return 1;
        return 0;
      },
      render: (row) => {
        const status = row.rsvpStatus;
        if (isNil(status?.rideFromTelAviv)) return "-";
        return status?.rideFromTelAviv ? (
          <BusIcon color="primary" fontSize="small" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("rsvpStatusTab.noData")}
          </Typography>
        );
      },
    },
    {
      id: "submitted",
      label: t("rsvpStatusTab.status"),
      sortable: true,
      sortFn: (a, b) => {
        const aSubmitted = a.rsvpStatus?.isSubmitted;
        const bSubmitted = b.rsvpStatus?.isSubmitted;

        // Sort priority: submitted (true) -> draft (false) -> null/undefined
        if (aSubmitted === bSubmitted) return 0;
        if (aSubmitted === true && bSubmitted !== true) return -1;
        if (bSubmitted === true && aSubmitted !== true) return 1;
        if (aSubmitted === false && bSubmitted === null) return -1;
        if (bSubmitted === false && aSubmitted === null) return 1;
        return 0;
      },
      render: (row) => {
        const status = row.rsvpStatus;
        return status?.isSubmitted ? (
          <Chip
            label={t("rsvpStatusTab.submitted")}
            size="small"
            color="info"
          />
        ) : (
          <Chip
            label={t("rsvpStatusTab.draft")}
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      },
    },
  ];

  if (isLoadingRSVP || isLoadingInvitees) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>{t("rsvpStatusTab.loadingData")}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Statistics Cards */}
      <Stack spacing={3} sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("rsvpStatusTab.statistics")}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.totalInvitations")}
              value={stats.totalInvitees}
              icon={<PeopleIcon />}
              color="info"
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.submittedRSVP")}
              value={stats.submittedCount}
              icon={<EventAvailableIcon />}
              color="primary"
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.attending")}
              value={stats.attendingCount}
              icon={<CheckIcon />}
              color="success"
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.totalGuests")}
              value={stats.totalGuests}
              icon={<GroupIcon />}
              color="secondary"
            />
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.sleepover")}
              value={stats.sleepoverCount}
              icon={<HotelIcon />}
              color="warning"
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <StatCard
              title={t("rsvpStatusTab.transportation")}
              value={stats.rideCount}
              icon={<BusIcon />}
              color="error"
            />
          </Box>
        </Stack>
      </Stack>

      {/* Table */}
      <Paper sx={{ mt: 3 }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            {t("rsvpStatusTab.rsvpList")}
          </Typography>
          <DSTable
            columns={columns}
            data={inviteesWithRSVP}
            showExport
            exportFilename="rsvp-status"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default RSVPStatusTab;
