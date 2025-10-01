import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Hotel as HotelIcon,
  DirectionsBus as BusIcon,
} from "@mui/icons-material";
import { Invitee } from "../invitees/InviteList";

interface RSVPEventSummaryProps {
  invitees: Invitee[];
}

const RSVPEventSummary: React.FC<RSVPEventSummaryProps> = ({ invitees }) => {
  const rsvpStats = useMemo(() => {
    const attending = invitees.filter(
      (invitee) => invitee.rsvpStatus?.attendance === true
    );
    const notAttending = invitees.filter(
      (invitee) => invitee.rsvpStatus?.attendance === false
    );
    const pending = invitees.filter(
      (invitee) =>
        invitee.rsvpStatus?.attendance === undefined ||
        invitee.rsvpStatus?.attendance === null
    );

    const totalGuestCount = attending.reduce(
      (sum, invitee) => sum + (invitee.rsvpStatus?.amount || 1),
      0
    );

    const needingSleepover = attending.filter(
      (invitee) => invitee.rsvpStatus?.sleepover === true
    ).length;

    const needingRide = attending.filter(
      (invitee) => invitee.rsvpStatus?.rideFromTelAviv === true
    ).length;

    const responseRate =
      invitees.length > 0
        ? Math.round(
            ((attending.length + notAttending.length) / invitees.length) * 100
          )
        : 0;

    return {
      attending: attending.length,
      notAttending: notAttending.length,
      pending: pending.length,
      totalGuestCount,
      needingSleepover,
      needingRide,
      responseRate,
    };
  }, [invitees]);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card
          elevation={2}
          sx={{ bgcolor: "success.light", color: "success.contrastText" }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 32, color: "inherit" }} />
              <Typography variant="h4" component="div" color="inherit">
                {rsvpStats.attending}
              </Typography>
              <Typography color="inherit" variant="body2">
                Attending
              </Typography>
              <Typography variant="caption" color="inherit">
                {rsvpStats.totalGuestCount} total guests
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card
          elevation={2}
          sx={{ bgcolor: "error.light", color: "error.contrastText" }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CancelIcon sx={{ fontSize: 32, color: "inherit" }} />
              <Typography variant="h4" component="div" color="inherit">
                {rsvpStats.notAttending}
              </Typography>
              <Typography color="inherit" variant="body2">
                Not Attending
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card
          elevation={2}
          sx={{ bgcolor: "warning.light", color: "warning.contrastText" }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 32, color: "inherit" }} />
              <Typography variant="h4" component="div" color="inherit">
                {rsvpStats.pending}
              </Typography>
              <Typography color="inherit" variant="body2">
                Pending Response
              </Typography>
              <Typography variant="caption" color="inherit">
                {rsvpStats.responseRate}% responded
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card
          elevation={2}
          sx={{ bgcolor: "info.light", color: "info.contrastText" }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <HotelIcon sx={{ fontSize: 32, color: "inherit" }} />
              <Typography variant="h4" component="div" color="inherit">
                {rsvpStats.needingSleepover}
              </Typography>
              <Typography color="inherit" variant="body2">
                Need Sleepover
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card
          elevation={2}
          sx={{ bgcolor: "secondary.light", color: "secondary.contrastText" }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <BusIcon sx={{ fontSize: 32, color: "inherit" }} />
              <Typography variant="h4" component="div" color="inherit">
                {rsvpStats.needingRide}
              </Typography>
              <Typography color="inherit" variant="body2">
                Need Ride from TA
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RSVPEventSummary;
