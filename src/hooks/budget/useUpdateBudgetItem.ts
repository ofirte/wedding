import { useQueryClient } from "@tanstack/react-query";
import { updateBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "@wedding-plan/types";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a budget item
 * @returns Mutation result object for updating budget items
 */
export const useUpdateBudgetItem = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      { id, data }: { id: string; data: Partial<BudgetItem> },
      weddingId?: string
    ) => updateBudgetItem(id, data, weddingId),
    options: {
      onSuccess: () => {
        console.log("Budget item updated successfully");
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      },
    },
  });
};
