import {  useQueryClient } from "@tanstack/react-query";
import { updateBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "../../components/budget/BudgetPlanner";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a budget item
 * @returns Mutation result object for updating budget items
 */
export const useUpdateBudgetItem = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetItem> }) =>
      updateBudgetItem(id, data),
    options: {
      onSuccess: () => {
        console.log("Budget item updated successfully");
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      },
    },
  });
};
