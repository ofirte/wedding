import { useQueryClient } from "@tanstack/react-query";
import { createBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "../../components/budget/BudgetPlanner";
import { useWeddingMutation } from "../common";

export const useCreateBudgetItem = () => {
  const queryClient = useQueryClient();
  // Using our custom wedding mutation hook
  return useWeddingMutation({
    mutationFn: (newBudgetItem: Omit<BudgetItem,"id">) => createBudgetItem(newBudgetItem),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      },
    },
  });
};
