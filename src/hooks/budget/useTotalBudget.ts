import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTotalBudget,
  updateTotalBudget,
  TotalBudgetDoc,
} from "../../api/budget/budgetApi";

// Export the TotalBudgetDoc interface
export type { TotalBudgetDoc } from "../../api/budget/budgetApi";

// Hook for managing total budget
export const useTotalBudget = () => {
  const queryClient = useQueryClient();

  // Query to fetch the total budget
  const { data, isLoading, isError } = useQuery<TotalBudgetDoc>({
    queryKey: ["totalBudget"],
    queryFn: fetchTotalBudget,
  });

  // Mutation to update the total budget
  const { mutate: setTotalBudget } = useMutation({
    mutationFn: (newAmount: number) => updateTotalBudget(newAmount),
    onSuccess: () => {
      // Invalidate and refetch the total budget query
      queryClient.invalidateQueries({ queryKey: ["totalBudget"] });
    },
  });

  return {
    totalBudget: data?.amount || 0,
    setTotalBudget,
    isLoading,
    isError,
  };
};
