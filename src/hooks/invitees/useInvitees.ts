import { useQuery } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { Invitee } from "../../components/invitees/InviteList";

/**
 * Custom hook to fetch invitees data using TanStack Query
 * Provides automatic caching and re-fetching capabilities
 */
export const useInvitees = () => {
  return useQuery({
    queryKey: ["invitees"],
    queryFn: () =>
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
      }),
    // Using refetchOnWindowFocus false as we already have realtime updates through onSnapshot
    refetchOnWindowFocus: false,
  });
};
