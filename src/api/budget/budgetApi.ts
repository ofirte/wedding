import {
  weddingFirebase,
  createCollectionAPI,
} from "../weddingFirebaseHelpers";
import { BudgetItem } from "@wedding-plan/types";

// Define the type for total budget document
export interface TotalBudgetDoc {
  amount: number;
}

// Create all CRUD operations for budget items (DRY approach)
const budgetAPI = createCollectionAPI<BudgetItem>("budget");

// Export the standard CRUD operations
export const fetchBudgetItems = budgetAPI.fetchAll;
export const subscribeToBudgetItems = budgetAPI.subscribe;
export const fetchBudgetItem = budgetAPI.fetchById;
export const createBudgetItem = budgetAPI.create;
export const updateBudgetItem = budgetAPI.update;
export const deleteBudgetItem = budgetAPI.delete;
export const bulkUpdateBudgetItems = budgetAPI.bulkUpdate;
export const bulkDeleteBudgetItems = budgetAPI.bulkDelete;

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
