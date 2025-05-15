import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "../../components/budget/BudgetPlanner";

/**
 * Hook to create a budget item
 * @returns Mutation result object for creating budget items
 */
export const useCreateBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<BudgetItem, "id">) => createBudgetItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
    },
  });
};
