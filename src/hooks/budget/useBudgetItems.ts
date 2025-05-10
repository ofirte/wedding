import { useQuery } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { BudgetItem } from "../../components/budget/BudgetPlanner";

/**
 * Custom hook to fetch budget items using TanStack Query
 * Provides automatic caching and re-fetching capabilities
 */
export const useBudgetItems = () => {
  return useQuery({
    queryKey: ["budgetItems"],
    queryFn: () =>
      new Promise<BudgetItem[]>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          collection(db, "budget"),
          (snapshot) => {
            const budgetItems = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name,
                group: data.group,
                expectedPrice: data.expectedPrice,
                actualPrice: data.actualPrice,
                downPayment: data.downPayment,
                contractsUrls: data.contractsUrls,
              };
            });
            resolve(budgetItems);
          },
          (error) => {
            if (error.code === "permission-denied") {
              console.error("Error fetching budget items: ", error.message);
              reject(error);
            } else {
              console.error("Error fetching budget items: ", error);
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
