import {
  createCollectionAPI,
  weddingFirebase,
} from "../weddingFirebaseHelpers";
import { Invitee } from "../../components/invitees/InviteList";
import { RSVPStatus } from "../rsvp/rsvpStatusTypes";

// Create all CRUD operations for invitees (DRY approach)
const inviteesAPI = createCollectionAPI<Invitee>("invitee");

// Export the standard CRUD operations
export const fetchInvitees = inviteesAPI.fetchAll;
export const subscribeToInvitees = inviteesAPI.subscribe;
export const fetchInvitee = inviteesAPI.fetchById;
export const createInvitee = inviteesAPI.create;
export const updateInvitee = inviteesAPI.update;
export const deleteInvitee = inviteesAPI.delete;
export const bulkUpdateInvitees = inviteesAPI.bulkUpdate;
export const bulkDeleteInvitees = inviteesAPI.bulkDelete;

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
  // First get the current invitee to merge the RSVP status

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
