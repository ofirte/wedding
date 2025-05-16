import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { deleteBudgetItem } from "../../api/budget/budgetApi";
import { useWeddingMutation } from "../common";

export const useDeleteBudgetItem = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
