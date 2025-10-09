import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import {
  People as PeopleIcon,
  Group as GroupIcon,
  PhoneDisabled as PhoneDisabledIcon,
} from "@mui/icons-material";
import { Invitee } from "./InviteList";
import { useTranslation } from "../../localization/LocalizationContext";

interface SummaryInfoProps {
  invitees: Invitee[];
}

const SummaryInfo: React.FC<SummaryInfoProps> = ({ invitees }) => {
  const { t } = useTranslation();

  const guestStats = useMemo(() => {
    const totalInviteeRecords = invitees.length;
    // Total expected guests (including plus-ones)
    const totalExpectedGuests = invitees.reduce(
      (acc, invitee) =>
        acc + (isNaN(Number(invitee.amount)) ? 0 : Number(invitee.amount)),
      0
    );
    const missingPhoneNumbers = invitees.filter(
      (invitee) => !invitee.cellphone || invitee.cellphone.trim() === ""
    ).length;


    return {
      totalInviteeRecords,
      totalExpectedGuests,
      missingPhoneNumbers,
    };
  }, [invitees]);
  const gridSize = guestStats.missingPhoneNumbers
    ? {
        xs: 12,
        sm: 6,
        md: 4,
      }
    : {
        xs: 12,
        sm: 6,
        md: 6,
      };
  return (
    <Grid container spacing={3}>
      <Grid size={gridSize}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <GroupIcon sx={{ fontSize: 40, color: "success.main" }} />
              <Typography variant="h5" component="div">
                {guestStats.totalExpectedGuests}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.totalExpectedGuests")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={gridSize}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h5" component="div">
                {guestStats.totalInviteeRecords}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.inviteeRecords")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {guestStats.missingPhoneNumbers !== 0 && (
        <Grid size={gridSize}>
          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <PhoneDisabledIcon
                  sx={{ fontSize: 40, color: "warning.main" }}
                />
                <Typography variant="h5" component="div">
                  {guestStats.missingPhoneNumbers}
                </Typography>
                <Typography color="text.secondary">
                  {t("guests.missingPhoneNumbers")}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default SummaryInfo;
