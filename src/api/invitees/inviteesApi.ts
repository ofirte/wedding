import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Invitee } from "../../components/invitees/InviteList";

export const fetchInvitees = () =>
  new Promise<Invitee[]>((resolve, reject) => {
    const unsubscribe = onSnapshot(
      collection(db, "invitee"),
      (snapshot) => {
        const inviteesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            rsvp: data.rsvp,
            percentage: data.percentage,
            side: data.side,
            relation: data.relation,
            amount: data.amount,
            amountConfirm: data.amountConfirm,
            cellphone: data.cellphone,
          };
        });
        resolve(inviteesData);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.error("Error fetching invitees: ", error.message);
          reject(error);
        } else {
          console.error("Error fetching invitees: ", error);
          reject(error);
        }
      }
    );

    // Return unsubscribe function for cleanup
    return unsubscribe;
  });

export const updateInvitee = async (
  id: string,
  updatedFields: Partial<Invitee>
) => {
  const inviteeRef = doc(db, "invitee", id);

  // Remove undefined fields to prevent Firestore errors
  const sanitizedFields = Object.entries(updatedFields).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  return await updateDoc(inviteeRef, sanitizedFields);
};

export const deleteInvitee = async (id: string) => {
  return await deleteDoc(doc(db, "invitee", id));
};

export const createInvitee = async (invitee: Omit<Invitee, "id">) => {
  return await addDoc(collection(db, "invitee"), invitee);
};
