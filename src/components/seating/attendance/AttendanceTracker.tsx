import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Invitee, Table } from "@wedding-plan/types";
import { useInvitees, useUpdateInvitee } from "../../../hooks/invitees";
import { useTables } from "../../../hooks/seating";
import DSTable, { Column } from "../../common/DSTable";
import { useTranslation } from "../../../localization/LocalizationContext";
import { responsivePatterns } from "../../../utils/ResponsiveUtils";

interface AttendanceData extends Invitee {
  tableNumber?: string | number;
  tableName?: string;
}

const AttendanceTracker: React.FC = () => {
  const { t } = useTranslation();
  const { data: invitees = [] } = useInvitees();
  const { data: tables = [] } = useTables();
  const { mutate: updateInvitee } = useUpdateInvitee();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle copy URL to clipboard
  const handleCopyUrl = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, []);

  // Create a map of guest ID to table assignment
  const guestToTableMap = useMemo(() => {
    const map = new Map<string, Table>();
    tables.forEach((table) => {
      table.assignedGuests.forEach((guestId) => {
        map.set(guestId, table);
      });
    });
    return map;
  }, [tables]);

  // Filter and enrich invitees with table assignment
  const filteredInvitees = useMemo(() => {
    let filtered = invitees;

    // Filter by RSVP status unless "show all" is enabled
    if (!showAll) {
      // Only show confirmed guests
      filtered = filtered.filter(
        (invitee) => invitee.rsvpStatus?.attendance === true
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((invitee) =>
        invitee.name.toLowerCase().includes(query)
      );
    }

    // Enrich with table data
    const enriched: AttendanceData[] = filtered.map((invitee) => {
      const table = guestToTableMap.get(invitee.id);
      return {
        ...invitee,
        tableNumber: table?.number,
        tableName: table?.name,
      };
    });

    // Sort by name (default sort)
    return enriched.sort((a, b) => a.name.localeCompare(b.name));
  }, [invitees, searchQuery, showAll, guestToTableMap]);

  // Handle check-in toggle
  const handleCheckInToggle = useCallback(
    (inviteeId: string, currentStatus: boolean | undefined) => {
      const invitee = invitees.find((inv) => inv.id === inviteeId);
      if (!invitee) return;

      const newStatus = !currentStatus;
      const updates: Partial<Invitee> = {
        actualAttendance: newStatus,
      };

      // If checking in for the first time, auto-populate actual amount
      if (newStatus && !invitee.actualAmount) {
        const confirmedAmount = parseInt(
          invitee.rsvpStatus?.amount || "0",
          10
        );
        updates.actualAmount = confirmedAmount || 1;
      }

      // Set check-in timestamp
      if (newStatus) {
        updates.checkedInAt = new Date();
      }

      updateInvitee({ id: inviteeId, data: updates });
    },
    [invitees, updateInvitee]
  );

  // Handle actual amount update
  const handleActualAmountChange = useCallback(
    (inviteeId: string, newAmount: number) => {
      updateInvitee({
        id: inviteeId,
        data: { actualAmount: newAmount },
      });
    },
    [updateInvitee]
  );

  // Define table columns
  const columns: Column<AttendanceData>[] = useMemo(
    () => [
      {
        id: "name",
        label: t("seating.attendance.columns.guestName"),
        sortable: true,
        render: (row) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.name}
            </Typography>
          </Box>
        ),
      },
      {
        id: "rsvpStatus",
        label: t("seating.attendance.columns.rsvpStatus"),
        sortable: true,
        sortFn: (a, b) => {
          const statusA = a.rsvpStatus?.attendance;
          const statusB = b.rsvpStatus?.attendance;
          if (statusA === statusB) return 0;
          if (statusA === true) return -1;
          if (statusB === true) return 1;
          if (statusA === false) return 1;
          return -1;
        },
        render: (row) => {
          const attendance = row.rsvpStatus?.attendance;
          const isSubmitted = row.rsvpStatus?.isSubmitted;

          if (attendance === true) {
            return (
              <Chip
                icon={<CheckCircleIcon />}
                label={t("seating.attendance.rsvpStatus.confirmed")}
                color="success"
                size="small"
              />
            );
          } else if (attendance === false) {
            return (
              <Chip
                icon={<CancelIcon />}
                label={t("seating.attendance.rsvpStatus.declined")}
                color="error"
                size="small"
              />
            );
          } else if (isSubmitted) {
            return (
              <Chip
                icon={<PendingIcon />}
                label={t("seating.attendance.rsvpStatus.notAttending")}
                color="default"
                size="small"
              />
            );
          }
          return (
            <Chip
              icon={<PendingIcon />}
              label={t("seating.attendance.rsvpStatus.notResponded")}
              color="warning"
              size="small"
            />
          );
        },
      },
      {
        id: "confirmedAmount",
        label: t("seating.attendance.columns.confirmedAmount"),
        sortable: true,
        sortFn: (a, b) => {
          const amountA = parseInt(a.rsvpStatus?.amount || "0", 10);
          const amountB = parseInt(b.rsvpStatus?.amount || "0", 10);
          return amountA - amountB;
        },
        render: (row) => {
          const amount = row.rsvpStatus?.amount || "-";
          return <Typography variant="body2">{amount}</Typography>;
        },
      },
      {
        id: "actualAmount",
        label: t("seating.attendance.columns.actualAmount"),
        sortable: true,
        sortFn: (a, b) => (a.actualAmount || 0) - (b.actualAmount || 0),
        render: (row) => {
          // Only show if checked in
          if (!row.actualAttendance) {
            return <Typography variant="body2" color="text.secondary">-</Typography>;
          }

          return (
            <TextField
              type="number"
              size="small"
              value={row.actualAmount || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 0) {
                  handleActualAmountChange(row.id, value);
                }
              }}
              inputProps={{
                min: 0,
                max: 20,
                style: { textAlign: 'center' }
              }}
              sx={{
                width: 60,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'action.selected',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 0.5,
                  fontSize: '0.875rem',
                },
              }}
            />
          );
        },
      },
      {
        id: "tableAssignment",
        label: t("seating.attendance.columns.tableAssignment"),
        sortable: true,
        sortFn: (a, b) => {
          const tableA = a.tableNumber?.toString() || "";
          const tableB = b.tableNumber?.toString() || "";
          return tableA.localeCompare(tableB);
        },
        render: (row) => {
          if (!row.tableNumber) {
            return (
              <Typography variant="body2" color="text.secondary">
                {t("seating.attendance.table.notAssigned")}
              </Typography>
            );
          }
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {t("seating.attendance.table.tableNumber", { number: row.tableNumber })}
              </Typography>
              {row.tableName && (
                <Typography variant="caption" color="text.secondary">
                  {row.tableName}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: "checkInStatus",
        label: t("seating.attendance.columns.checkInStatus"),
        sortable: true,
        sortFn: (a, b) => {
          const statusA = a.actualAttendance ? 1 : 0;
          const statusB = b.actualAttendance ? 1 : 0;
          return statusB - statusA;
        },
        render: (row) => {
          return (
            <Switch
              checked={row.actualAttendance || false}
              onChange={() =>
                handleCheckInToggle(row.id, row.actualAttendance)
              }
            />
          );
        },
      },
    ],
    [handleCheckInToggle, handleActualAmountChange, showAll, t]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box >
        <Typography variant="h4" gutterBottom>
          {t("seating.attendance.title")}
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ ...responsivePatterns.containerPadding }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder={t("seating.attendance.filters.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title={t("seating.attendance.filters.showAllExplanation")}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                  />
                }
                label={t("seating.attendance.filters.showAll")}
              />
            </Tooltip>
            <Tooltip title={copySuccess ? "Copied!" : "Copy link"}>
              <IconButton onClick={handleCopyUrl} color={copySuccess ? "success" : "default"}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Attendance Table */}
        <DSTable
          columns={columns}
          data={filteredInvitees}
          showExport={true}
          exportFilename="attendance-tracker"
          mobileCardTitle={(row) => row.name}
          variant="compact"
        />

    </Box>
  );
};

export default AttendanceTracker;
