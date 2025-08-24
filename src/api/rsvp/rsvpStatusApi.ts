import { weddingFirebase } from "../weddingFirebaseHelpers";
import { RSVPStatus } from "./rsvpStatusTypes";
import { setDoc } from "firebase/firestore";

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
    await setDoc(docRef, rsvpStatus);

    console.log(`RSVP status updated for invitee ${inviteeId}`);
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
