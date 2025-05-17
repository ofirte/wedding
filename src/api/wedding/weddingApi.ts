import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { WeddingUser } from "../auth/authApi";

export interface Wedding {
  id: string;
  name: string;
  date: Date | null;
  createdAt: Date;
  userIds: string[];
  brideName?: string;
  groomName?: string;
}

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
  weddingId: string
): Promise<Wedding> => {
  try {
    const weddingRef = doc(db, "weddings", weddingId);
    const weddingDoc = await getDoc(weddingRef);

    if (!weddingDoc.exists()) {
      throw new Error("Wedding not found");
    }

    const weddingData = weddingDoc.data() as Wedding;
    const updatedUserIds = [...weddingData.userIds, userId];

    await setDoc(weddingRef, { userIds: updatedUserIds }, { merge: true });

    await setDoc(doc(db, "users", userId), { weddingId }, { merge: true });

    return {
      ...weddingData,
    };
  } catch (error) {
    console.error("Error joining wedding:", error);
    throw error;
  }
};
