import { weddingFirebase } from "../weddingFirebaseHelpers";
import { RSVPStatus } from "./rsvpStatusTypes";
import { setDoc, getDocs } from "firebase/firestore";

/**
 * Updates RSVP status for an invitee (supports partial updates)
 * Creates or updates the rsvpStatus document in the invitees/{inviteeId}/rsvpStatus subcollection
 * @param inviteeId The ID of the invitee
 * @param rsvpStatus The RSVP status data to save (can be partial for updates)
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateRSVPStatus = async (
  inviteeId: string,
  rsvpStatus: Partial<RSVPStatus> | Record<string, any>,
  weddingId?: string
): Promise<void> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    // Get document reference
    const docRef = await weddingFirebase.getDocRef(
      `invitee/${inviteeId}/rsvpStatus`,
      "current",
      resolvedWeddingId
    );

    // Use setDoc to handle both create and update cases
    // This will create the document if it doesn't exist, or completely overwrite existing data
    await setDoc(docRef, rsvpStatus, { merge: true });

  } catch (error) {
    console.error("Error updating RSVP status:", error);
    throw error;
  }
};

/**
 * Fetches RSVP status for an invitee
 * @param inviteeId The ID of the invitee
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns The RSVP status or null if not found
 */
export const getRSVPStatus = async (
  inviteeId: string,
  weddingId?: string
): Promise<RSVPStatus | null> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    return await weddingFirebase.getDocument<RSVPStatus>(
      `invitee/${inviteeId}/rsvpStatus`,
      "current",
      resolvedWeddingId
    );
  } catch (error) {
    console.error("Error fetching RSVP status:", error);
    return null;
  }
};

/**
 * Fetches all RSVP statuses across all invitees using collection group query
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns A Promise that resolves with a record of invitee IDs to their RSVP status
 */
export const fetchAllRSVPStatuses = async (
  weddingId?: string
): Promise<Record<string, RSVPStatus>> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    // Get all invitees first, then fetch their RSVP statuses
    const inviteesCollectionRef = await weddingFirebase.getCollectionRef(
      "invitee",
      resolvedWeddingId
    );
    const inviteesSnapshot = await getDocs(inviteesCollectionRef);

    const rsvpStatuses: Record<string, RSVPStatus> = {};

    // Fetch RSVP status for each invitee
    const fetchPromises = inviteesSnapshot.docs.map(async (inviteeDoc) => {
      try {
        const inviteeId = inviteeDoc.id;
        const rsvpStatus = await weddingFirebase.getDocument<RSVPStatus>(
          `invitee/${inviteeId}/rsvpStatus`,
          "current",
          resolvedWeddingId
        );

        if (rsvpStatus) {
          rsvpStatuses[inviteeId] = rsvpStatus;
        }
      } catch (error) {
        console.warn(
          `Error fetching RSVP status for invitee ${inviteeDoc.id}:`,
          error
        );
        // Continue processing other invitees
      }
    });

    await Promise.all(fetchPromises);

    return rsvpStatuses;
  } catch (error) {
    console.error("Error fetching RSVP statuses:", error);
    return {};
  }
};
