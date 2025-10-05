import { fetchBudgetItems } from "../../api/budget/budgetApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch budget items
 * @returns Query result object containing budget items data and query state
 */
export const useBudgetItems = () => {
  return useWeddingQuery({
    queryKey: ["budgetItems"],
    queryFn: fetchBudgetItems,
    options: { refetchOnWindowFocus: false },
  });
};
