import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { updateBudgetItem } from "../../api/budget/budgetApi";
import { BudgetItem } from "@wedding-plan/types";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a budget item with optimistic updates
 * Updates the UI immediately while the server request happens in the background
 * @returns Mutation result object for updating budget items
 */
export const useUpdateBudgetItemOptimistic = () => {
  const queryClient = useQueryClient();
  const { weddingId } = useParams<{ weddingId: string }>();

  return useWeddingMutation<
    void,
    { id: string; data: Partial<BudgetItem> },
    Error,
    { previousBudgetItems: BudgetItem[] | undefined }
  >({
    mutationFn: (
      { id, data }: { id: string; data: Partial<BudgetItem> },
      weddingId?: string
    ) => updateBudgetItem(id, data, weddingId),
    options: {
      // Optimistic update - apply changes immediately
      onMutate: async ({ id, data }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ["budgetItems", weddingId],
        });

        // Snapshot current value for rollback
        const previousBudgetItems = queryClient.getQueryData<BudgetItem[]>([
          "budgetItems",
          weddingId,
        ]);

        // Optimistically update the cache
        queryClient.setQueryData<BudgetItem[]>(
          ["budgetItems", weddingId],
          (old) =>
            old?.map((item) =>
              item.id === id ? { ...item, ...data } : item
            )
        );

        return { previousBudgetItems };
      },
      // Rollback on error
      onError: (_err, _variables, context) => {
        if (context?.previousBudgetItems) {
          queryClient.setQueryData(
            ["budgetItems", weddingId],
            context.previousBudgetItems
          );
        }
      },
      // Refetch after mutation to ensure sync with server
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["budgetItems", weddingId] });
      },
    },
  });
};
