import { weddingFirebase } from "../weddingFirebaseHelpers";
import { Invitee } from "../../components/invitees/InviteList";

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
