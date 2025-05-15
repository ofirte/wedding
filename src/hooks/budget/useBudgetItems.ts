import { useQuery } from "@tanstack/react-query";
import { fetchBudgetItems } from "../../api/budget/budgetApi";

/**
 * Hook to fetch budget items
 * @returns Query result object containing budget items data and query state
 */
export const useBudgetItems = () => {
  return useQuery({
    queryKey: ["budgetItems"],
    queryFn: fetchBudgetItems,
    // Using refetchOnWindowFocus false as we already have realtime updates through onSnapshot
    refetchOnWindowFocus: false,
  });
};
