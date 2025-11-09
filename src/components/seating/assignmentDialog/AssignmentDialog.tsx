import React, { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Clear as ClearIcon,
  AutoFixHigh as AutoFixHighIcon,
} from "@mui/icons-material";
import { Table } from "../../../../shared/src/models/seating";
import { Invitee } from "../../../../shared/src/models/invitee";
import { useTranslation } from "src/localization/LocalizationContext";
import UnassignedGuestsList from "./UnassignedGuestsList";
import TablesAssignmentList from "./TablesAssignmentList";
import { useAssignmentState } from "./hooks/useAssignmentState";
import { useFilteredGuests } from "./hooks/useFilteredGuests";
import { useGuestSelection } from "./hooks/useGuestSelection";
import { useAssignmentStats } from "./hooks/useAssignmentStats";
import { useGuestAssignment } from "./hooks/useGuestAssignment";

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (assignments: Map<string, string[]>) => Promise<void>;
  onUpdateTable?: (tableId: string, updates: Partial<Table>) => void;
  tables: Table[];
  invitees: Invitee[];
  initialAssignments?: Map<string, string[]>;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onClose,
  onApply,
  onUpdateTable,
  tables,
  invitees,
  initialAssignments,
}) => {
  const { t } = useTranslation();
  const [isApplying, setIsApplying] = useState(false);

  // Custom hooks - managing state and logic
  const { assignments, setAssignments, assignedGuestIds } = useAssignmentState({
    open,
    initialAssignments,
  });

  const {
    searchQuery,
    setSearchQuery,
    relationFilter,
    setRelationFilter,
    sideFilter,
    setSideFilter,
    filteredUnassignedGuests,
    relations,
    sides,
  } = useFilteredGuests({
    invitees,
    assignedGuestIds,
  });

  const { selectedGuests, handleToggleGuest, handleSelectAll, clearSelection } =
    useGuestSelection({
      filteredUnassignedGuests,
    });

  const stats = useAssignmentStats({
    invitees,
    assignedGuestIds,
    assignments,
    tables,
  });

  const {
    bulkAssignTableId,
    setBulkAssignTableId,
    isAutoAssigning,
    handleAssignGuestToTable,
    handleRemoveGuestFromTable,
    handleBulkAssign,
    handleAutoAssign,
    handleClearAll,
  } = useGuestAssignment({
    assignments,
    setAssignments,
    assignedGuestIds,
    invitees,
    tables,
    selectedGuests,
    clearSelection,
    onUpdateTable,
    t,
  });

  // Performance optimization: Create guest map for O(1) lookups
  const guestMap = useMemo(() => {
    const map = new Map<string, Invitee>();
    invitees.forEach((invitee) => map.set(invitee.id, invitee));
    return map;
  }, [invitees]);

  // Get guest by ID using optimized map lookup
  const getGuest = useCallback(
    (guestId: string) => guestMap.get(guestId),
    [guestMap]
  );

  // Handle table name update
  const handleTableNameUpdate = useCallback(
    (tableId: string, name: string) => {
      if (onUpdateTable) {
        onUpdateTable(tableId, { name });
      }
    },
    [onUpdateTable]
  );

  // Handle apply
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(assignments);
      onClose();
    } catch (error) {
      console.error("Failed to apply assignments:", error);
      alert(t("seating.assignmentDialog.applyFailed"));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "90vh" },
      }}
    >
      <DialogTitle sx={{ bgcolor: "info.light", color: "info.contrastText" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t("seating.assignmentDialog.title")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                isAutoAssigning ? (
                  <CircularProgress size={16} />
                ) : (
                  <AutoFixHighIcon />
                )
              }
              sx={{
                color: "info.contrastText",
                borderColor: "info.contrastText",
              }}
              onClick={handleAutoAssign}
              disabled={isAutoAssigning || stats.unassignedCount === 0}
            >
              {t("seating.assignmentDialog.autoAssign")}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              disabled={stats.assignedCount === 0}
              sx={{
                color: ({ palette }) => palette.error.main,
                borderColor: ({ palette }) => palette.error.main,
              }}
            >
              {t("seating.assignmentDialog.clearAll")}
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <UnassignedGuestsList
            filteredGuests={filteredUnassignedGuests}
            selectedGuests={selectedGuests}
            searchQuery={searchQuery}
            relationFilter={relationFilter}
            sideFilter={sideFilter}
            relations={relations}
            sides={sides}
            unassignedCount={stats.unassignedCount}
            bulkAssignTableId={bulkAssignTableId}
            tables={tables}
            assignments={assignments}
            onSearchChange={setSearchQuery}
            onRelationFilterChange={setRelationFilter}
            onSideFilterChange={setSideFilter}
            onToggleGuest={handleToggleGuest}
            onSelectAll={handleSelectAll}
            onBulkAssign={handleBulkAssign}
            onBulkAssignTableChange={setBulkAssignTableId}
          />

          <TablesAssignmentList
            tables={tables}
            assignments={assignments}
            getGuest={getGuest}
            onRemoveGuest={handleRemoveGuestFromTable}
            onDropGuest={handleAssignGuestToTable}
            onUpdateTableName={handleTableNameUpdate}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isApplying}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={isApplying}
          startIcon={isApplying && <CircularProgress size={16} />}
        >
          {t("seating.assignmentDialog.applyChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog;
