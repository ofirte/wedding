import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { createBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "../../components/budget/BudgetPlanner";
import { useWeddingMutation } from "../common";

export const useCreateBudgetItem = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useWeddingMutation({
    mutationFn: (newBudgetItem: Omit<BudgetItem, "id">) =>
      createBudgetItem(newBudgetItem),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
