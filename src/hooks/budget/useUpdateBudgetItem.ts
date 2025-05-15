import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "../../components/budget/BudgetPlanner";

/**
 * Hook to update a budget item
 * @returns Mutation result object for updating budget items
 */
export const useUpdateBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetItem> }) =>
      updateBudgetItem(id, data),
    onSuccess: () => {
      console.log("Budget item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
    },
  });
};
