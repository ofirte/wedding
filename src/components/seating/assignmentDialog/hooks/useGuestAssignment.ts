import { useState, useCallback } from "react";
import { Table } from "../../../../../shared/src/models/seating";
import { Invitee } from "../../../../../shared/src/models/invitee";
import { autoAssignGuests } from "src/utils/autoAssignment";
import { getGuestAmount } from "./utils";

interface UseGuestAssignmentProps {
  assignments: Map<string, string[]>;
  setAssignments: React.Dispatch<React.SetStateAction<Map<string, string[]>>>;
  assignedGuestIds: Set<string>;
  invitees: Invitee[];
  tables: Table[];
  selectedGuests: Set<string>;
  clearSelection: () => void;
  onUpdateTable?: (tableId: string, updates: Partial<Table>) => void;
  t: (key: string, params?: any) => string;
}

interface UseGuestAssignmentReturn {
  bulkAssignTableId: string;
  setBulkAssignTableId: (tableId: string) => void;
  isAutoAssigning: boolean;
  handleAssignGuestToTable: (guestId: string, tableId: string) => void;
  handleRemoveGuestFromTable: (guestId: string, tableId: string) => void;
  handleBulkAssign: () => void;
  handleAutoAssign: () => void;
  handleClearAll: () => void;
}

/**
 * Custom hook to handle all guest assignment operations
 */
export const useGuestAssignment = ({
  assignments,
  setAssignments,
  assignedGuestIds,
  invitees,
  tables,
  selectedGuests,
  clearSelection,
  onUpdateTable,
  t,
}: UseGuestAssignmentProps): UseGuestAssignmentReturn => {
  const [bulkAssignTableId, setBulkAssignTableId] = useState<string>("");
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Handle assign to table (single guest)
  const handleAssignGuestToTable = useCallback(
    (guestId: string, tableId: string) => {
      setAssignments((prev) => {
        const next = new Map(prev);

        // Remove from old table if exists
        next.forEach((guests, tId) => {
          const filtered = guests.filter((id) => id !== guestId);
          if (filtered.length !== guests.length) {
            next.set(tId, filtered);
          }
        });

        // Add to new table
        const tableGuests = next.get(tableId) || [];
        next.set(tableId, [...tableGuests, guestId]);

        return next;
      });
    },
    [setAssignments]
  );

  // Handle remove guest from table
  const handleRemoveGuestFromTable = useCallback(
    (guestId: string, tableId: string) => {
      setAssignments((prev) => {
        const next = new Map(prev);
        const tableGuests = next.get(tableId) || [];
        next.set(
          tableId,
          tableGuests.filter((id) => id !== guestId)
        );
        return next;
      });
    },
    [setAssignments]
  );

  // Handle bulk assign selected guests
  const handleBulkAssign = useCallback(() => {
    if (!bulkAssignTableId || selectedGuests.size === 0) return;

    const table = tables.find((t) => t.id === bulkAssignTableId);
    if (!table) return;

    // Calculate current used capacity based on guest amounts
    const currentAssignedIds = assignments.get(table.id) || [];
    const currentUsedCapacity = currentAssignedIds.reduce((sum, guestId) => {
      const guest = invitees.find((inv) => inv.id === guestId);
      return sum + (guest ? getGuestAmount(guest) : 0);
    }, 0);

    // Calculate total guest count for selected invitees
    const selectedGuestCount = Array.from(selectedGuests).reduce(
      (sum, guestId) => {
        const guest = invitees.find((inv) => inv.id === guestId);
        return sum + (guest ? getGuestAmount(guest) : 0);
      },
      0
    );

    const remainingCapacity = table.capacity - currentUsedCapacity;

    if (selectedGuestCount > remainingCapacity) {
      if (
        !window.confirm(
          t("seating.assignmentDialog.confirmOverCapacity", {
            selected: selectedGuestCount,
            remaining: remainingCapacity,
          })
        )
      ) {
        return;
      }
    }

    setAssignments((prev) => {
      const next = new Map(prev);
      const tableGuests = next.get(bulkAssignTableId) || [];
      next.set(bulkAssignTableId, [
        ...tableGuests,
        ...Array.from(selectedGuests),
      ]);
      return next;
    });

    clearSelection();
    setBulkAssignTableId("");
  }, [
    bulkAssignTableId,
    selectedGuests,
    tables,
    assignments,
    invitees,
    t,
    setAssignments,
    clearSelection,
  ]);

  // Handle auto-assign
  const handleAutoAssign = useCallback(() => {
    setIsAutoAssigning(true);
    try {
      const unassigned = invitees.filter(
        (inv) => !assignedGuestIds.has(inv.id)
      );

      if (unassigned.length === 0) {
        alert(t("seating.autoAssignment.noGuestsToAssign"));
        setIsAutoAssigning(false);
        return;
      }

      const availableTables = tables.map((table) => ({
        ...table,
        assignedGuests: assignments.get(table.id) || [],
      }));

      if (availableTables.length === 0) {
        alert(t("seating.autoAssignment.noTablesAvailable"));
        setIsAutoAssigning(false);
        return;
      }

      // Use default grouping rules
      const rules = {
        groupByRelation: true,
        groupBySide: true,
      };

      const result = autoAssignGuests(unassigned, availableTables, rules);

      // Merge with existing assignments
      const newAssignments = new Map(assignments);
      result.assignments.forEach((guestIds, tableId) => {
        const existing = newAssignments.get(tableId) || [];
        newAssignments.set(tableId, [...existing, ...guestIds]);
      });

      // Apply table names if onUpdateTable is provided
      if (onUpdateTable) {
        result.tableNames.forEach((name, tableId) => {
          onUpdateTable(tableId, { name });
        });
      }

      setAssignments(newAssignments);
      clearSelection();
    } catch (error) {
      console.error("Auto-assignment failed:", error);
      alert("Auto-assignment failed. Please try again.");
    } finally {
      setIsAutoAssigning(false);
    }
  }, [
    invitees,
    assignedGuestIds,
    tables,
    assignments,
    t,
    onUpdateTable,
    setAssignments,
    clearSelection,
  ]);

  // Handle clear all - clears both assignments and table names
  const handleClearAll = useCallback(() => {
    if (window.confirm(t("seating.assignmentDialog.confirmClearAll"))) {
      // Clear all guest assignments
      setAssignments(new Map());
      clearSelection();

      // Clear table names if onUpdateTable is available
      if (onUpdateTable) {
        tables.forEach((table) => {
          if (table.name) {
            onUpdateTable(table.id, { name: "" });
          }
        });
      }
    }
  }, [t, setAssignments, clearSelection, onUpdateTable, tables]);

  return {
    bulkAssignTableId,
    setBulkAssignTableId,
    isAutoAssigning,
    handleAssignGuestToTable,
    handleRemoveGuestFromTable,
    handleBulkAssign,
    handleAutoAssign,
    handleClearAll,
  };
};
