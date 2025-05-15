import { fetchTotalBudget, TotalBudgetDoc } from "../../api/budget/budgetApi";
import { useWeddingQuery } from "../common";

export type { TotalBudgetDoc } from "../../api/budget/budgetApi";

export const useTotalBudget = () => {
  return useWeddingQuery<TotalBudgetDoc>({
    queryKey: ["totalBudget"],
    queryFn: fetchTotalBudget,
  });
};
