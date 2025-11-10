/**
 * Auto-assignment algorithm for seating guests
 * Groups guests by relation and side, then assigns them to tables
 */

import { Invitee, Table } from "@wedding-plan/types";
import { getGuestAmount, calculateUsedCapacity } from "./seatingUtils";

interface AssignmentRules {
  groupByRelation: boolean;
  groupBySide: boolean;
}

interface GuestGroup {
  guests: Invitee[];
  relation?: string;
  side?: string;
}

interface AutoAssignmentResult {
  assignments: Map<string, string[]>;
  tableNames: Map<string, string>;
}

/**
 * Auto-assign guests to tables based on grouping rules
 * @param unassignedGuests - List of guests without table assignments
 * @param tables - List of available tables
 * @param allInvitees - All invitees (needed for capacity calculation)
 * @param rules - Grouping rules for assignment
 * @returns Object containing assignments map and suggested table names map
 */
export function autoAssignGuests(
  unassignedGuests: Invitee[],
  tables: Table[],
  allInvitees: Invitee[],
  rules: AssignmentRules
): AutoAssignmentResult {
  const assignments = new Map<string, string[]>();
  const tableNames = new Map<string, string>();

  // Sort tables by available capacity (descending)
  const sortedTables = [...tables]
    .map((table) => ({
      ...table,
      availableSeats: table.capacity - calculateUsedCapacity(table.assignedGuests, allInvitees),
    }))
    .filter((table) => table.availableSeats > 0)
    .sort((a, b) => b.availableSeats - a.availableSeats);

  if (sortedTables.length === 0) {
    return { assignments, tableNames }; // No available tables
  }

  // Group guests based on rules
  const groups = groupGuests(unassignedGuests, rules);

  // Track table capacity, relations, and sides
  const tableCapacity = new Map<string, number>();
  const tableRelations = new Map<string, Set<string>>();
  const tableSides = new Map<string, Set<string>>();
  sortedTables.forEach((table) => {
    tableCapacity.set(table.id, table.availableSeats);
    tableRelations.set(table.id, new Set());
    tableSides.set(table.id, new Set());
  });

  let currentTableIndex = 0;

  // Assign groups to tables
  for (const group of groups) {
    // Calculate actual group size using guest amounts
    const groupSize = group.guests.reduce((sum, guest) => sum + getGuestAmount(guest), 0);

    // Find a table that can fit the group
    let assigned = false;
    for (let i = currentTableIndex; i < sortedTables.length; i++) {
      const table = sortedTables[i];
      const available = tableCapacity.get(table.id) || 0;

      if (available >= groupSize) {
        // Assign entire group to this table
        const existingAssignments = assignments.get(table.id) || [];
        const newAssignments = [...existingAssignments, ...group.guests.map((g) => g.id)];
        assignments.set(table.id, newAssignments);

        // Track relation and side for this table
        if (group.relation) {
          tableRelations.get(table.id)?.add(group.relation);
        }
        if (group.side) {
          tableSides.get(table.id)?.add(group.side);
        }

        tableCapacity.set(table.id, available - groupSize);

        // If table is full, move to next table
        if (tableCapacity.get(table.id) === 0) {
          currentTableIndex = i + 1;
        } else {
          currentTableIndex = i;
        }

        assigned = true;
        break;
      }
    }

    // If group doesn't fit anywhere, split it across tables
    if (!assigned) {
      let remainingGuests = [...group.guests];

      for (let i = currentTableIndex; i < sortedTables.length && remainingGuests.length > 0; i++) {
        const table = sortedTables[i];
        const available = tableCapacity.get(table.id) || 0;

        if (available > 0) {
          // Take guests until we reach capacity
          const toAssign: Invitee[] = [];
          let usedCapacity = 0;

          for (const guest of remainingGuests) {
            const guestAmount = getGuestAmount(guest);
            if (usedCapacity + guestAmount <= available) {
              toAssign.push(guest);
              usedCapacity += guestAmount;
            } else {
              break;
            }
          }

          if (toAssign.length > 0) {
            const existingAssignments = assignments.get(table.id) || [];
            const newAssignments = [...existingAssignments, ...toAssign.map((g) => g.id)];
            assignments.set(table.id, newAssignments);

            // Track relation and side for this table
            if (group.relation) {
              tableRelations.get(table.id)?.add(group.relation);
            }
            if (group.side) {
              tableSides.get(table.id)?.add(group.side);
            }

            remainingGuests = remainingGuests.filter(g => !toAssign.includes(g));
            tableCapacity.set(table.id, available - usedCapacity);
          }

          if (remainingGuests.length > 0) {
            currentTableIndex = i + 1;
          }
        }
      }
    }
  }

  // Generate table names based on relations and sides
  tableRelations.forEach((relations, tableId) => {
    if (relations.size > 0) {
      const relationArray = Array.from(relations).sort();
      const sideArray = Array.from(tableSides.get(tableId) || []).sort();

      let tableName = "";

      // Build relation part
      if (relationArray.length === 1) {
        tableName = relationArray[0];
      } else if (relationArray.length > 1) {
        tableName = relationArray.join(" & ");
      }

      // Add side part in parentheses if available
      if (sideArray.length > 0) {
        const sidesText = sideArray.join(" & ");
        tableName += ` (${sidesText})`;
      }

      if (tableName) {
        tableNames.set(tableId, tableName);
      }
    }
  });

  return { assignments, tableNames };
}

/**
 * Group guests based on grouping rules
 */
function groupGuests(guests: Invitee[], rules: AssignmentRules): GuestGroup[] {
  if (!rules.groupByRelation && !rules.groupBySide) {
    // No grouping - return individual guests
    return guests.map((guest) => ({ guests: [guest] }));
  }

  const groups = new Map<string, GuestGroup>();

  for (const guest of guests) {
    let key = "";

    if (rules.groupByRelation && guest.relation) {
      key += `relation:${guest.relation}`;
    }

    if (rules.groupBySide && guest.side) {
      key += key ? `_side:${guest.side}` : `side:${guest.side}`;
    }

    // If no key (guest has no relation/side), create individual key
    if (!key) {
      key = `individual:${guest.id}`;
    }

    if (!groups.has(key)) {
      groups.set(key, {
        guests: [],
        relation: rules.groupByRelation ? guest.relation : undefined,
        side: rules.groupBySide ? guest.side : undefined,
      });
    }

    groups.get(key)!.guests.push(guest);
  }

  // Sort groups by size (larger groups first for better packing)
  return Array.from(groups.values()).sort((a, b) => b.guests.length - a.guests.length);
}

/**
 * Calculate total capacity needed based on actual guest amounts
 */
export function calculateCapacityNeeded(guests: Invitee[]): number {
  return guests.reduce((sum, guest) => sum + getGuestAmount(guest), 0);
}

/**
 * Calculate available capacity in tables based on actual guest amounts
 * Requires allInvitees to calculate used capacity properly
 */
export function calculateAvailableCapacity(tables: Table[], allInvitees: Invitee[]): number {
  return tables.reduce((sum, table) => {
    const usedCapacity = calculateUsedCapacity(table.assignedGuests, allInvitees);
    const available = table.capacity - usedCapacity;
    return sum + (available > 0 ? available : 0);
  }, 0);
}
