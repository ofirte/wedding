import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBudgetItem } from "../../api/budget/budgetApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete a budget item
 * @returns Mutation result object for deleting budget items
 */
export const useDeleteBudgetItem = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      },
    },
  });
};
