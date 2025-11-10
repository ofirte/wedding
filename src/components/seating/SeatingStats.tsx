import React, { useMemo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import {
  TableRestaurant as TableIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { Table, Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { getGuestAmount } from "../../utils/seatingUtils";

interface SeatingStatsProps {
  tables: Table[];
  invitees: Invitee[];
  inline?: boolean;
}

const SeatingStats: React.FC<SeatingStatsProps> = ({
  tables,
  invitees,
  inline = false,
}) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    // Calculate total guests based on RSVP amounts for attending guests only
    const totalGuests = invitees
      .filter((inv) => inv.rsvpStatus?.attendance)
      .reduce((sum, invitee) => sum + getGuestAmount(invitee), 0);

    // Get set of assigned guest IDs from all tables
    const assignedGuestIds = new Set<string>();
    tables.forEach((table) => {
      table.assignedGuests.forEach((guestId) => assignedGuestIds.add(guestId));
    });

    // Calculate assigned count (sum of amounts for assigned invitees)
    const assignedCount = invitees
      .filter((inv) => assignedGuestIds.has(inv.id))
      .reduce((sum, invitee) => sum + getGuestAmount(invitee), 0);

    const unassignedCount = totalGuests - assignedCount;
    const assignedPercentage =
      totalGuests > 0
        ? Math.round((assignedCount / totalGuests) * 100)
        : 0;

    return {
      totalTables: tables.length,
      totalGuests,
      totalCapacity,
      assigned: assignedCount,
      unassigned: unassignedCount,
      assignedPercentage,
    };
  }, [tables, invitees]);

  if (inline) {
    // Compact inline version for toolbar
    return (
      <Stack direction="row" spacing={1}>
        <Chip
          icon={<TableIcon />}
          label={`${stats.totalTables} ${t("seating.stats.totalTables")}`}
          size="small"
          variant="outlined"
        />
        <Chip
          icon={<GroupIcon />}
          label={`${stats.totalGuests} ${t("seating.stats.totalGuests")}`}
          size="small"
          variant="outlined"
          color="info"
        />
        <Chip
          icon={<CheckIcon />}
          label={`${stats.assigned} ${t("seating.stats.assigned")}`}
          size="small"
          variant="outlined"
          color="success"
        />
        <Chip
          icon={<PendingIcon />}
          label={`${stats.unassigned} ${t("seating.stats.unassigned")}`}
          size="small"
          variant="outlined"
          color="warning"
        />
      </Stack>
    );
  }

  // Full stats display for sidebar or main view
  return (
    <Box>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("seating.stats.totalTables")}
          </Typography>
          <Typography variant="h6">{stats.totalTables}</Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("seating.stats.totalGuests")}
          </Typography>
          <Typography variant="h6">{stats.totalGuests}</Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("seating.stats.assigned")}
          </Typography>
          <Typography variant="h6" color="success.main">
            {stats.assigned} ({stats.assignedPercentage}%)
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("seating.stats.unassigned")}
          </Typography>
          <Typography variant="h6" color="warning.main">
            {stats.unassigned}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {t("seating.stats.capacityUsed")}
          </Typography>
          <Typography variant="h6">
            {stats.assigned} / {stats.totalCapacity}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default SeatingStats;
