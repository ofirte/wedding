import { weddingFirebase } from "../weddingFirebaseHelpers";
import { BudgetItem } from "../../components/budget/BudgetPlanner";

// Define the type for total budget document
export interface TotalBudgetDoc {
  amount: number;
}

/**
 * Fetches all budget items from Firebase for the current user's wedding
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns A Promise that resolves with an array of budget items
 */
export const fetchBudgetItems = (weddingId?: string) =>
  new Promise<BudgetItem[]>((resolve, reject) => {
    weddingFirebase
      .listenToCollection<BudgetItem>(
        "budget",
        (budgetItems) => resolve(budgetItems),
        (error) => reject(error),
        weddingId
      )
      .catch((error) => {
        console.error("Error setting up budget items listener:", error);
        resolve([]);
      });
  });

/**
 * Creates a new budget item for the current user's wedding
 * @param item Budget item to create (without ID)
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const createBudgetItem = async (
  item: Omit<BudgetItem, "id">,
  weddingId?: string
) => {
  return await weddingFirebase.addDocument("budget", item, weddingId);
};

/**
 * Updates an existing budget item for the current user's wedding
 * @param id ID of the budget item to update
 * @param updatedFields Fields to update in the budget item
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateBudgetItem = async (
  id: string,
  updatedFields: Partial<BudgetItem>,
  weddingId?: string
) => {
  return await weddingFirebase.updateDocument<BudgetItem>(
    "budget",
    id,
    updatedFields,
    weddingId
  );
};

/**
 * Deletes a budget item for the current user's wedding
 * @param id ID of the budget item to delete
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const deleteBudgetItem = async (id: string, weddingId?: string) => {
  return await weddingFirebase.deleteDocument("budget", id, weddingId);
};

/**
 * Fetch total budget for the current user's wedding
 * Creates a default budget if none exists
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const fetchTotalBudget = async (
  weddingId?: string
): Promise<TotalBudgetDoc> => {
  const defaultBudget: TotalBudgetDoc = { amount: 0 };
  return weddingFirebase.getOrCreateSettings<TotalBudgetDoc>(
    "totalBudget",
    defaultBudget,
    weddingId
  );
};

/**
 * Update total budget for the current user's wedding
 * @param amount The new budget amount
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateTotalBudget = async (
  amount: number,
  weddingId?: string
): Promise<void> => {
  return weddingFirebase.updateSettings<TotalBudgetDoc>(
    "totalBudget",
    { amount },
    weddingId
  );
};
