import {
  createCollectionAPI,
} from "../weddingFirebaseHelpers";
import { SeatingArrangement, Table, Invitee, LayoutElement } from "@wedding-plan/types";
import { calculateUsedCapacity, getGuestAmount } from "../../utils/seatingUtils";

// Create all CRUD operations for seating arrangements (DRY approach)
const seatingAPI = createCollectionAPI<SeatingArrangement>("seating");
const tablesAPI = createCollectionAPI<Table>("tables");
const layoutElementsAPI = createCollectionAPI<LayoutElement>("layoutElements");

// Export the standard CRUD operations for seating arrangements
export const fetchSeatingArrangements = seatingAPI.fetchAll;
export const subscribeToSeatingArrangements = seatingAPI.subscribe;
export const fetchSeatingArrangement = seatingAPI.fetchById;
export const createSeatingArrangement = seatingAPI.create;
export const updateSeatingArrangement = seatingAPI.update;
export const deleteSeatingArrangement = seatingAPI.delete;

// Export the standard CRUD operations for tables
export const fetchTables = tablesAPI.fetchAll;
export const subscribeToTables = tablesAPI.subscribe;
export const fetchTable = tablesAPI.fetchById;
export const createTable = tablesAPI.create;
export const updateTable = tablesAPI.update;
export const deleteTable = tablesAPI.delete;
export const bulkUpdateTables = tablesAPI.bulkUpdate;
export const bulkDeleteTables = tablesAPI.bulkDelete;

// Export the standard CRUD operations for layout elements
export const fetchLayoutElements = layoutElementsAPI.fetchAll;
export const subscribeToLayoutElements = layoutElementsAPI.subscribe;
export const fetchLayoutElement = layoutElementsAPI.fetchById;
export const createLayoutElement = layoutElementsAPI.create;
export const updateLayoutElement = layoutElementsAPI.update;
export const deleteLayoutElement = layoutElementsAPI.delete;
export const bulkUpdateLayoutElements = layoutElementsAPI.bulkUpdate;
export const bulkDeleteLayoutElements = layoutElementsAPI.bulkDelete;

/**
 * Get list of unassigned guests
 * @param allInvitees All invitees from the wedding
 * @param tables All tables with their assigned guests
 * @returns List of invitees that are not assigned to any table
 */
export const getUnassignedGuests = (
  allInvitees: Invitee[],
  tables: Table[]
): Invitee[] => {
  const assignedIds = new Set(tables.flatMap((table) => table.assignedGuests));
  return allInvitees.filter((invitee) => !assignedIds.has(invitee.id));
};

/**
 * Get assigned guests for a specific table
 * @param tableId The table ID
 * @param tables All tables
 * @param allInvitees All invitees
 * @returns List of invitees assigned to the table
 */
export const getTableGuests = (
  tableId: string,
  tables: Table[],
  allInvitees: Invitee[]
): Invitee[] => {
  const table = tables.find((t) => t.id === tableId);
  if (!table) return [];

  return allInvitees.filter((invitee) =>
    table.assignedGuests.includes(invitee.id)
  );
};

/**
 * Assign a guest to a table
 * @param guestId Invitee ID to assign
 * @param tableId Table ID to assign to
 * @param tables All tables
 * @param allInvitees All invitees (needed for capacity calculation)
 * @param weddingId Optional wedding ID
 */
export const assignGuestToTable = async (
  guestId: string,
  tableId: string,
  tables: Table[],
  allInvitees: Invitee[],
  weddingId?: string
): Promise<void> => {
  const table = tables.find((t) => t.id === tableId);
  if (!table) {
    throw new Error("Table not found");
  }

  // Check if guest is already assigned to this table
  if (table.assignedGuests.includes(guestId)) {
    return; // Already assigned
  }

  // Check capacity using actual guest amounts
  const currentUsedCapacity = calculateUsedCapacity(table.assignedGuests, allInvitees);
  const guestToAssign = allInvitees.find((inv) => inv.id === guestId);
  const guestAmount = guestToAssign ? getGuestAmount(guestToAssign) : 1;

  if (currentUsedCapacity + guestAmount > table.capacity) {
    throw new Error("Table is at full capacity");
  }

  // Add guest to table
  const updatedGuests = [...table.assignedGuests, guestId];
  await updateTable(tableId, { assignedGuests: updatedGuests }, weddingId);
};

/**
 * Remove a guest from a table
 * @param guestId Invitee ID to remove
 * @param tableId Table ID to remove from
 * @param weddingId Optional wedding ID
 */
export const removeGuestFromTable = async (
  guestId: string,
  tableId: string,
  tables: Table[],
  weddingId?: string
): Promise<void> => {
  const table = tables.find((t) => t.id === tableId);
  if (!table) {
    throw new Error("Table not found");
  }

  // Remove guest from table
  const updatedGuests = table.assignedGuests.filter((id) => id !== guestId);
  await updateTable(tableId, { assignedGuests: updatedGuests }, weddingId);
};

/**
 * Move a guest from one table to another
 * @param guestId Invitee ID to move
 * @param fromTableId Source table ID
 * @param toTableId Destination table ID
 * @param tables All tables
 * @param allInvitees All invitees (needed for capacity calculation)
 * @param weddingId Optional wedding ID
 */
export const moveGuestBetweenTables = async (
  guestId: string,
  fromTableId: string,
  toTableId: string,
  tables: Table[],
  allInvitees: Invitee[],
  weddingId?: string
): Promise<void> => {
  // Remove from old table
  await removeGuestFromTable(guestId, fromTableId, tables, weddingId);

  // Add to new table
  await assignGuestToTable(guestId, toTableId, tables, allInvitees, weddingId);
};
