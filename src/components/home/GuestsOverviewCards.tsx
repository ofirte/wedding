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
import { useTranslation } from "../../localization/LocalizationContext";
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
  const { t } = useTranslation();
  const guestStats = {
    total:
      guests?.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0) || 0,
    confirmed:
      guests?.reduce(
        (acc, guest) =>
          acc + parseInt(guest?.rsvpStatus?.amount?.toString() || "0"),
        0
      ) || 0,
    pending:
      guests?.filter((guest) => guest?.rsvpStatus?.attendance === undefined)
        .length || 0,
    declined:
      guests?.filter((guest) => guest?.rsvpStatus?.attendance === false)
        .length || 0,
  };

  const responseRate =
    guestStats.total > 0
      ? ((guestStats.confirmed + guestStats.declined) / guestStats.total) * 100
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
          }}
        >
          {t("guests.guestList")}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("../invite")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
        >
          {t("common.details")}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {t("common.responseRate")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color:
                responseRate >= 80
                  ? "success.main"
                  : responseRate >= 50
                  ? "warning.main"
                  : "primary.main",
            }}
          >
            {guestStats.confirmed + guestStats.declined} / {guestStats.total}{" "}
            {t("common.guests")}
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={responseRate}
          color={
            responseRate >= 80
              ? "success"
              : responseRate >= 50
              ? "warning"
              : "primary"
          }
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background:
                responseRate >= 80
                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : responseRate >= 50
                  ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      <Stack direction="row" spacing={2}>
        <Box
          flex={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.success.light}`,
            background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor: theme.palette.success.main,
            },
          }}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "success.dark",
              fontSize: "0.8rem",
            }}
          >
            {t("guests.confirmed")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "success.main",
            }}
          >
            {guestStats.confirmed}
          </Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.warning.light}`,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}08 0%, ${theme.palette.warning.light}08 100%)`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor: theme.palette.warning.main,
            },
          }}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "warning.dark",
              fontSize: "0.8rem",
            }}
          >
            {t("guests.pending")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "warning.main",
            }}
          >
            {guestStats.pending}
          </Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
            background: `linear-gradient(135deg, ${theme.palette.error.main}08 0%, ${theme.palette.error.light}08 100%)`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor: theme.palette.error.main,
            },
          }}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "error.dark",
              fontSize: "0.8rem",
            }}
          >
            {t("guests.declined")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "error.main",
            }}
          >
            {guestStats.declined}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default GuestOverviewCard;
