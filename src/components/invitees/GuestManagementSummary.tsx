import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import {
  People as PeopleIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { Invitee } from "@wedding-plan/types";
interface GuestManagementSummaryProps {
  invitees: Invitee[];
}

const GuestManagementSummary: React.FC<GuestManagementSummaryProps> = ({
  invitees,
}) => {
  const guestManagementStats = useMemo(() => {
    const totalInvitees = invitees.length;
    const withPhoneNumbers = invitees.filter(
      (invitee) => invitee.cellphone && invitee.cellphone.trim() !== ""
    ).length;

    // Count unique relations as family groups
    const familyGroups = new Set(
      invitees
        .map((invitee) => invitee.relation)
        .filter((relation) => relation && relation.trim() !== "")
    ).size;

    // Count invitees who can bring additional guests (amount > 1)
    const withPlusOnes = invitees.filter(
      (invitee) => invitee.amount > 1
    ).length;

    // Count different sides (bride/groom)
    const sides = new Set(
      invitees
        .map((invitee) => invitee.side)
        .filter((side) => side && side.trim() !== "")
    ).size;

    return {
      totalInvitees,
      withPhoneNumbers,
      familyGroups,
      withPlusOnes,
      sides,
      phonePercentage:
        totalInvitees > 0
          ? Math.round((withPhoneNumbers / totalInvitees) * 100)
          : 0,
    };
  }, [invitees]);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PeopleIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4" component="div">
                {guestManagementStats.totalInvitees}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total Invitees
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PhoneIcon sx={{ fontSize: 32, color: "success.main" }} />
              <Typography variant="h4" component="div">
                {guestManagementStats.withPhoneNumbers}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                With Phone Numbers
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({guestManagementStats.phonePercentage}%)
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <GroupIcon sx={{ fontSize: 32, color: "info.main" }} />
              <Typography variant="h4" component="div">
                {guestManagementStats.sides}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Bride/Groom Sides
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <GroupIcon sx={{ fontSize: 32, color: "secondary.main" }} />
              <Typography variant="h4" component="div">
                {guestManagementStats.familyGroups}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Relation Groups
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PersonAddIcon sx={{ fontSize: 32, color: "warning.main" }} />
              <Typography variant="h4" component="div">
                {guestManagementStats.withPlusOnes}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                With Plus-Ones
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default GuestManagementSummary;
