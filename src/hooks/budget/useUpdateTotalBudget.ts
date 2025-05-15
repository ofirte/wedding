import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTotalBudget } from "../../api/budget/budgetApi";

export const useUpdateTotalBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newAmount: number) => updateTotalBudget(newAmount),
    onSuccess: () => {
      // Invalidate and refetch the total budget query
      queryClient.invalidateQueries({ queryKey: ["totalBudget"] });
    },
  });
};
