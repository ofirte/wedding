import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Wedding } from "../wedding/weddingApi";
import { Invitee } from "../../components/invitees/InviteList";
import { RSVPStatus } from "../rsvp/rsvpStatusTypes";

/**
 * Public API functions for guest RSVP access (no authentication required)
 * These functions directly access Firebase without the weddingFirebase wrapper
 */

/**
 * Get wedding details for public/guest access
 * @param weddingId The wedding ID
 * @returns Wedding details or null if not found
 */
export const getPublicWeddingDetails = async (
  weddingId: string
): Promise<Wedding | null> => {
  try {
    const weddingDoc = await getDoc(doc(db, "weddings", weddingId));
    if (!weddingDoc.exists()) return null;

    return {
      id: weddingId,
      ...(weddingDoc.data() as Omit<Wedding, "id">),
    };
  } catch (error) {
    console.error("Error getting public wedding details:", error);
    return null;
  }
};

/**
 * Get invitee details for public/guest access
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @returns Invitee details or null if not found
 */
export const getPublicInvitee = async (
  weddingId: string,
  inviteeId: string
): Promise<Invitee | null> => {
  try {
    const inviteeDoc = await getDoc(
      doc(db, "weddings", weddingId, "invitee", inviteeId)
    );
    if (!inviteeDoc.exists()) return null;

    return {
      id: inviteeId,
      ...(inviteeDoc.data() as Omit<Invitee, "id">),
    };
  } catch (error) {
    console.error("Error getting public invitee details:", error);
    return null;
  }
};

/**
 * Get RSVP status for public/guest access
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @returns RSVP status or null if not found
 */
export const getPublicRSVPStatus = async (
  weddingId: string,
  inviteeId: string
): Promise<RSVPStatus | null> => {
  try {
    const rsvpDoc = await getDoc(
      doc(db, "weddings", weddingId, "invitee", inviteeId, "rsvpStatus", "current")
    );
    if (!rsvpDoc.exists()) return null;

    return rsvpDoc.data() as RSVPStatus;
  } catch (error) {
    console.error("Error getting public RSVP status:", error);
    return null;
  }
};

/**
 * Update RSVP status for public/guest access
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @param rsvpStatus The RSVP status data
 */
export const updatePublicRSVPStatus = async (
  weddingId: string,
  inviteeId: string,
  rsvpStatus: Partial<RSVPStatus>
): Promise<void> => {
  try {
    const rsvpDocRef = doc(
      db,
      "weddings",
      weddingId,
      "invitee",
      inviteeId,
      "rsvpStatus",
      "current"
    );
    await setDoc(rsvpDocRef, rsvpStatus);
  } catch (error) {
    console.error("Error updating public RSVP status:", error);
    throw error;
  }
};