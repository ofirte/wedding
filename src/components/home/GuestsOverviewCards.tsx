import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  useTheme,
  Stack,
  LinearProgress,
  styled,
} from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useInvitees } from "../../hooks/invitees/useInvitees";

// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

const GuestOverviewCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: guests } = useInvitees();

  const guestStats = {
    total:
      guests?.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0) || 0,
    confirmed:
      guests?.filter((guest) => guest.rsvp === "confirmed").length || 0,
    pending: guests?.filter((guest) => guest.rsvp === "pending").length || 0,
    declined: guests?.filter((guest) => guest.rsvp === "declined").length || 0,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Guest List</Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("../invite")}
        >
          Details
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Response Rate
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {guestStats.confirmed + guestStats.declined} / {guestStats.total}{" "}
            guests
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={
            ((guestStats.confirmed + guestStats.declined) / guestStats.total) *
            100
          }
          color="primary"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2}>
        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "success.light",
            color: "success.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Confirmed
          </Typography>
          <Typography variant="h6">{guestStats.confirmed}</Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "warning.light",
            color: "warning.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Pending
          </Typography>
          <Typography variant="h6">{guestStats.pending}</Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "error.light",
            color: "error.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Declined
          </Typography>
          <Typography variant="h6">{guestStats.declined}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default GuestOverviewCard;
