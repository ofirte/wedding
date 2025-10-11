import { useQueryClient } from "@tanstack/react-query";
import { createBudgetItem } from "../../api/budget/budgetApi";
import { useWeddingMutation } from "../common";

export const useCreateBudgetItem = () => {
  const queryClient = useQueryClient();
  // Using our custom wedding mutation hook
  return useWeddingMutation({
    mutationFn: createBudgetItem,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
      },
    },
  });
};
