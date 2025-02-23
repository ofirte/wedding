
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { Invitee } from "./InviteList";

interface SummaryInfoProps {
  invitees: Invitee[];
}

const SummaryInfo: React.FC<SummaryInfoProps> = ({ invitees }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, color: "#1a237e" }} />
              <Typography variant="h5" component="div">
                {invitees.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0)}
              </Typography>
              <Typography color="text.secondary">Total Guests</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 40, color: "#2e7d32" }} />
              <Typography variant="h5" component="div">
                {invitees.filter((i) => i.rsvp === "Confirmed").length}
              </Typography>
              <Typography color="text.secondary">Confirmed</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <PendingIcon sx={{ fontSize: 40, color: "#ed6c02" }} />
              <Typography variant="h5" component="div">
                {invitees.filter((i) => i.rsvp === "Pending").length}
              </Typography>
              <Typography color="text.secondary">Pending</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={1} alignItems="center">
              <CancelIcon sx={{ fontSize: 40, color: "#d32f2f" }} />
              <Typography variant="h5" component="div">
                {invitees.filter((i) => i.rsvp === "Declined").length}
              </Typography>
              <Typography color="text.secondary">Declined</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SummaryInfo;