/**
 * Budget Model Types
 * Budget-related entity models shared between frontend and backend
 */

export interface BudgetItem {
  id: string;
  name: string;
  group: string;
  expectedPrice: number;
  actualPrice: number;
  downPayment: number;
  contractsUrls?: string[];
  createdAt?: string; // ISO timestamp for ordering
}

// Total budget document interface
export interface TotalBudgetDoc {
  id: string;
  totalBudget: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}
