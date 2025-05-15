import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { BudgetItem } from "../../components/budget/BudgetPlanner";

// Define the type for total budget document
export interface TotalBudgetDoc {
  amount: number;
}

/**
 * Fetches all budget items from Firebase
 * @returns A Promise that resolves with an array of budget items
 */
export const fetchBudgetItems = () =>
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
  });

/**
 * Creates a new budget item
 * @param item Budget item to create (without ID)
 */
export const createBudgetItem = async (item: Omit<BudgetItem, "id">) => {
  return await addDoc(collection(db, "budget"), item);
};

/**
 * Updates an existing budget item
 * @param id ID of the budget item to update
 * @param updatedFields Fields to update in the budget item
 */
export const updateBudgetItem = async (
  id: string,
  updatedFields: Partial<BudgetItem>
) => {
  const itemRef = doc(db, "budget", id);

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

  return await updateDoc(itemRef, sanitizedFields);
};

/**
 * Deletes a budget item
 * @param id ID of the budget item to delete
 */
export const deleteBudgetItem = async (id: string) => {
  return await deleteDoc(doc(db, "budget", id));
};

/**
 * Fetch total budget
 * Creates a default budget if none exists
 */
export const fetchTotalBudget = async (): Promise<TotalBudgetDoc> => {
  const docRef = doc(db, "settings", "totalBudget");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as TotalBudgetDoc;
  } else {
    // If no document exists, create one with a default value
    const defaultBudget: TotalBudgetDoc = { amount: 0 };
    await setDoc(docRef, defaultBudget);
    return defaultBudget;
  }
};

/**
 * Update total budget
 * @param amount The new budget amount
 */
export const updateTotalBudget = async (amount: number): Promise<void> => {
  const docRef = doc(db, "settings", "totalBudget");
  return setDoc(docRef, { amount });
};
