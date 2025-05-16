import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { updateTotalBudget } from "../../api/budget/budgetApi";
import { useWeddingMutation } from "../common";

export const useUpdateTotalBudget = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useWeddingMutation({
    mutationFn: (totalBudget: number) => updateTotalBudget(totalBudget),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["totalBudget"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
