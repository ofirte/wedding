import { weddingFirebase } from "../weddingFirebaseHelpers";
import { Invitee } from "../../components/invitees/InviteList";
import { RSVPStatus } from "../rsvp/rsvpStatusTypes";

/**
 * Fetches a single invitee by ID from Firebase for the current user's wedding
 * @param inviteeId The ID of the invitee to fetch
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns A Promise that resolves with the invitee data or null if not found
 */
export const fetchInvitee = async (
  inviteeId: string,
  weddingId?: string
): Promise<Invitee | null> => {
  return await weddingFirebase.getDocument<Invitee>(
    "invitee",
    inviteeId,
    weddingId
  );
};

/**
 * Fetches all invitees from Firebase for the current user's wedding
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns A Promise that resolves with an array of invitees
 */
export const fetchInvitees = (weddingId?: string) =>
  new Promise<Invitee[]>((resolve, reject) => {
    weddingFirebase
      .listenToCollection<Invitee>(
        "invitee",
        (invitees) => resolve(invitees),
        (error) => reject(error),
        weddingId
      )
      .catch((error) => {
        console.error("Error setting up invitees listener:", error);
        resolve([]);
      });
  });

/**
 * Updates an existing invitee for the current user's wedding
 * @param id ID of the invitee to update
 * @param updatedFields Fields to update in the invitee
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateInvitee = async (
  id: string,
  updatedFields: Partial<Invitee>,
  weddingId?: string
) => {
  return await weddingFirebase.updateDocument<Invitee>(
    "invitee",
    id,
    updatedFields,
    weddingId
  );
};

/**
 * Deletes an invitee for the current user's wedding
 * @param id ID of the invitee to delete
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const deleteInvitee = async (id: string, weddingId?: string) => {
  return await weddingFirebase.deleteDocument("invitee", id, weddingId);
};

/**
 * Bulk update multiple invitees for the current user's wedding
 * @param updates Array of objects with {id, data} to update
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const bulkUpdateInvitees = async (
  updates: Array<{ id: string; data: Partial<Invitee> }>,
  weddingId?: string
) => {
  return await weddingFirebase.bulkUpdateDocuments<Invitee>(
    "invitee",
    updates,
    weddingId
  );
};

/**
 * Bulk delete multiple invitees for the current user's wedding
 * @param inviteeIds Array of invitee IDs to delete
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const bulkDeleteInvitees = async (
  inviteeIds: string[],
  weddingId?: string
) => {
  return await weddingFirebase.bulkDeleteDocuments(
    "invitee",
    inviteeIds,
    weddingId
  );
};

/**
 * Creates a new invitee for the current user's wedding
 * @param invitee Invitee to create (without ID)
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const createInvitee = async (
  invitee: Omit<Invitee, "id">,
  weddingId?: string
) => {
  return await weddingFirebase.addDocument("invitee", invitee, weddingId);
};

/**
 * Updates RSVP status for an invitee using denormalized data structure
 * @param inviteeId The ID of the invitee
 * @param rsvpStatus The RSVP status data to update
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateInviteeRSVP = async (
  inviteeId: string,
  rsvpStatus: Partial<RSVPStatus> | Record<string, any>,
  weddingId?: string
): Promise<void> => {
  return await weddingFirebase.updateDocument(
    "invitee",
    inviteeId,
    { rsvpStatus: rsvpStatus } as Partial<Invitee>,
    weddingId
  );
};

/**
 * Fetches RSVP status for an invitee from the denormalized data
 * @param inviteeId The ID of the invitee
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns The RSVP status or null if not found
 */
export const fetchInviteeRSVP = async (
  inviteeId: string,
  weddingId?: string
): Promise<RSVPStatus | null> => {
  const invitee = await fetchInvitee(inviteeId, weddingId);
  return invitee?.rsvpStatus || null;
};
