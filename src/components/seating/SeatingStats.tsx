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
    const assignedCount = tables.reduce(
      (sum, t) => sum + t.assignedGuests.length,
      0
    );
    const unassignedCount = invitees.length - assignedCount;
    const assignedPercentage =
      invitees.length > 0
        ? Math.round((assignedCount / invitees.length) * 100)
        : 0;

    return {
      totalTables: tables.length,
      totalGuests: invitees.length,
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
