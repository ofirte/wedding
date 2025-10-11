import { useQueryClient } from "@tanstack/react-query";
import { updateTotalBudget } from "../../api/budget/budgetApi";
import { useWeddingMutation } from "../common";

export const useUpdateTotalBudget = () => {
  const queryClient = useQueryClient();
  return useWeddingMutation({
    mutationFn: updateTotalBudget,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["totalBudget"] });
      },
    },
  });
};
