import { useQuery } from "@tanstack/react-query";
import { fetchTotalBudget, TotalBudgetDoc } from "../../api/budget/budgetApi";

export type { TotalBudgetDoc } from "../../api/budget/budgetApi";

export const useTotalBudget = () => {
  return useQuery<TotalBudgetDoc>({
    queryKey: ["totalBudget"],
    queryFn: fetchTotalBudget,
  });
};
