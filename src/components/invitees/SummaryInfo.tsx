import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { Invitee } from "./InviteList";
import { useTranslation } from "../../localization/LocalizationContext";

interface SummaryInfoProps {
  invitees: Invitee[];
}

const SummaryInfo: React.FC<SummaryInfoProps> = ({ invitees }) => {
  const { t } = useTranslation();
  const guestStatuses = useMemo(() => {
    return {
      total: invitees.reduce(
        (acc, i) => acc + parseInt(i.amount.toString()),
        0
      ),
      confirmed: invitees
        .filter((i) => i.rsvp === "Confirmed")
        .reduce((acc, i) => acc + parseInt(i.amountConfirm.toString()), 0),
      pending: invitees
        .filter((i) => i.rsvp === "Pending")
        .reduce(
          (acc, i) =>
            acc +
            parseInt(i.amount.toString()) -
            parseInt(i.amountConfirm.toString()),
          0
        ),
      declined: invitees
        .filter((i) => i.rsvp === "Declined")
        .reduce(
          (acc, i) =>
            acc +
            parseInt(i.amount.toString()) -
            parseInt(i.amountConfirm.toString()),
          0
        ),
    };
  }, [invitees]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, color: "info.dark" }} />
              <Typography variant="h5" component="div">
                {guestStatuses.total}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.totalGuests")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
              <Typography variant="h5" component="div">
                {guestStatuses.confirmed}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.confirmed")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PendingIcon sx={{ fontSize: 40, color: "warning.main" }} />
              <Typography variant="h5" component="div">
                {guestStatuses.pending}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.pending")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CancelIcon sx={{ fontSize: 40, color: "error.main" }} />
              <Typography variant="h5" component="div">
                {guestStatuses.declined}
              </Typography>
              <Typography color="text.secondary">
                {t("guests.declined")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryInfo;
