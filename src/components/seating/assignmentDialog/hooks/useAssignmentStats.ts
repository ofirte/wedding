import { useMemo } from "react";
import { Table } from "../../../../../shared/src/models/seating";
import { Invitee } from "../../../../../shared/src/models/invitee";

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
 */
export const useAssignmentStats = ({
  invitees,
  assignedGuestIds,
  assignments,
  tables,
}: UseAssignmentStatsProps): AssignmentStats => {
  return useMemo(() => {
    const totalGuests = invitees.length;
    const assignedCount = assignedGuestIds.size;
    const tablesUsed = Array.from(assignments.values()).filter(
      (guests) => guests.length > 0
    ).length;
    const totalCapacity = tables.reduce(
      (sum, table) => sum + table.capacity,
      0
    );
    const usedCapacity = assignedCount;

    return {
      totalGuests,
      assignedCount,
      unassignedCount: totalGuests - assignedCount,
      tablesUsed,
      totalTables: tables.length,
      capacityPercent:
        totalCapacity > 0
          ? Math.round((usedCapacity / totalCapacity) * 100)
          : 0,
    };
  }, [invitees, assignedGuestIds, assignments, tables]);
};
