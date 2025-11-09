import { useMemo } from "react";
import { Table } from "../../../../../shared/src/models/seating";
import { Invitee } from "../../../../../shared/src/models/invitee";
import { getGuestAmount } from "./utils";

interface UseAssignmentStatsProps {
  invitees: Invitee[];
  assignedGuestIds: Set<string>;
  assignments: Map<string, string[]>;
  tables: Table[];
}

interface AssignmentStats {
  totalGuests: number;
  assignedCount: number;
  unassignedCount: number;
  tablesUsed: number;
  totalTables: number;
  capacityPercent: number;
}

/**
 * Custom hook to calculate assignment statistics
 * Calculates based on actual guest count (using rsvpStatus.amount)
 */
export const useAssignmentStats = ({
  invitees,
  assignedGuestIds,
  assignments,
  tables,
}: UseAssignmentStatsProps): AssignmentStats => {
  return useMemo(() => {
    // Calculate total guests based on RSVP amounts for attending guests only
    const totalGuests = invitees
      .filter((inv) => inv.rsvpStatus?.attendance)
      .reduce((sum, invitee) => sum + getGuestAmount(invitee), 0);

    // Calculate assigned guest count (sum of amounts for assigned invitees)
    const assignedCount = invitees
      .filter((inv) => assignedGuestIds.has(inv.id))
      .reduce((sum, invitee) => sum + getGuestAmount(invitee), 0);

    const tablesUsed = Array.from(assignments.values()).filter(
      (guests) => guests.length > 0
    ).length;

    const totalCapacity = tables.reduce(
      (sum, table) => sum + table.capacity,
      0
    );

    return {
      totalGuests,
      assignedCount,
      unassignedCount: totalGuests - assignedCount,
      tablesUsed,
      totalTables: tables.length,
      capacityPercent:
        totalCapacity > 0
          ? Math.round((assignedCount / totalCapacity) * 100)
          : 0,
    };
  }, [invitees, assignedGuestIds, assignments, tables]);
};
