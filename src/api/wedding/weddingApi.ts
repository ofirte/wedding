import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { generateInvitationCode } from "../auth/authApi";

export interface Wedding {
  id: string;
  name: string;
  date: Timestamp;
  createdAt: Date;
  userIds: string[];
  brideName?: string;
  groomName?: string;
  venueName?: string;
  invitationCode?: string;
}

// Find wedding by invitation code
export const getWeddingByInvitationCode = async (
  invitationCode: string
): Promise<Wedding | null> => {
  try {
    const weddingsRef = collection(db, "weddings");
    const q = query(weddingsRef, where("invitationCode", "==", invitationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const weddingDoc = querySnapshot.docs[0];
    return {
      id: weddingDoc.id,
      ...(weddingDoc.data() as Omit<Wedding, "id">),
    };
  } catch (error) {
    console.error("Error getting wedding by invitation code:", error);
    return null;
  }
};

// Get wedding details
export const getWeddingDetails = async (
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
    console.error("Error getting wedding details:", error);
    return null;
  }
};

export const joinWedding = async (
  userId: string,
  weddingIdOrCode: string,
  isInvitationCode: boolean = false
): Promise<Wedding> => {
  try {
    let weddingId: string;
    let weddingData: Wedding;

    if (isInvitationCode) {
      // Resolve invitation code to wedding ID
      const wedding = await getWeddingByInvitationCode(weddingIdOrCode);
      if (!wedding) {
        throw new Error("Invalid invitation code");
      }
      weddingId = wedding.id;
      weddingData = wedding;
    } else {
      // Use wedding ID directly
      weddingId = weddingIdOrCode;
      const weddingRef = doc(db, "weddings", weddingId);
      const weddingDoc = await getDoc(weddingRef);

      if (!weddingDoc.exists()) {
        throw new Error("Wedding not found");
      }
      weddingData = weddingDoc.data() as Wedding;
    }

    // Check if user is already part of this wedding
    if (weddingData.userIds.includes(userId)) {
      return weddingData;
    }

    // Add user to wedding
    const weddingRef = doc(db, "weddings", weddingId);
    const updatedUserIds = [...weddingData.userIds, userId];

    await setDoc(weddingRef, { userIds: updatedUserIds }, { merge: true });

    // Update user document with wedding ID
    await setDoc(doc(db, "users", userId), { weddingId }, { merge: true });

    return {
      ...weddingData,
      userIds: updatedUserIds,
    };
  } catch (error) {
    console.error("Error joining wedding:", error);
    throw error;
  }
};

// Update wedding details
export const updateWeddingDetails = async (
  weddingId: string,
  data: Partial<Wedding>
): Promise<void> => {
  try {
    const weddingRef = doc(db, "weddings", weddingId);

    // Convert Date to Timestamp if date is provided
    const updateData = { ...data };
    if (updateData.date && updateData.date instanceof Date) {
      updateData.date = Timestamp.fromDate(updateData.date);
    }

    await setDoc(weddingRef, updateData, { merge: true });
  } catch (error) {
    console.error("Error updating wedding details:", error);
    throw error;
  }
};

// Update wedding with invitation code if it doesn't exist
export const ensureWeddingHasInvitationCode = async (
  weddingId: string
): Promise<string> => {
  try {
    const weddingRef = doc(db, "weddings", weddingId);
    const weddingDoc = await getDoc(weddingRef);

    if (!weddingDoc.exists()) {
      throw new Error("Wedding not found");
    }

    const weddingData = weddingDoc.data() as Wedding;

    // If invitation code already exists, return it
    if (weddingData.invitationCode) {
      return weddingData.invitationCode;
    }

    // Generate new invitation code with collision detection
    const invitationCode = await generateInvitationCode(weddingData.name);

    // Update the wedding document
    await setDoc(weddingRef, { invitationCode }, { merge: true });

    return invitationCode;
  } catch (error) {
    console.error("Error ensuring wedding has invitation code:", error);
    throw error;
  }
};
