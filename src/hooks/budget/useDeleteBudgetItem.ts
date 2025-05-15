import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBudgetItem } from "../../api/budget/budgetApi";

/**
 * Hook to delete a budget item
 * @returns Mutation result object for deleting budget items
 */
export const useDeleteBudgetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
    },
  });
};
