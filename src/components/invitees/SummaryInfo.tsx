import React from "react";
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
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, color: "info.dark" }} />
              <Typography variant="h5" component="div">
                {invitees.reduce(
                  (acc, i) => acc + parseInt(i.amount.toString()),
                  0
                )}
              </Typography>
              <Typography color="text.secondary">{t("guests.totalGuests")}</Typography>
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
                {invitees.filter((i) => i.rsvp === "Confirmed").length}
              </Typography>
              <Typography color="text.secondary">{t("guests.confirmed")}</Typography>
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
                {invitees.filter((i) => i.rsvp === "Pending").length}
              </Typography>
              <Typography color="text.secondary">{t("guests.pending")}</Typography>
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
                {invitees.filter((i) => i.rsvp === "Declined").length}
              </Typography>
              <Typography color="text.secondary">{t("guests.declined")}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryInfo;
