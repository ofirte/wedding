import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  removeUserFromWedding,
} from "../../api/wedding/weddingApi";

interface RemoveUserFromWeddingVariables {
  weddingId: string;
  userId: string;
}

/**
 * Hook to add a user to a wedding
 * @param options Optional React Query mutation options
 * @returns Mutation hook for adding users to weddings
 */
export const useRemoveUserFromWedding = (
  options?: Omit<
    UseMutationOptions<void, unknown, RemoveUserFromWeddingVariables, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};
  return useMutation({
    mutationFn: async ({
      weddingId,
      userId,
    }: RemoveUserFromWeddingVariables) => {
      await removeUserFromWedding(weddingId, userId);
    },
    onSuccess: (data, variables) => {
      // Invalidate wedding queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["weddings"] });
      // Also invalidate the specific wedding if it's cached
      queryClient.invalidateQueries({
        queryKey: ["wedding", variables.weddingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["weddingDetails", variables.weddingId],
      });
      onSuccess?.(data, variables, undefined);
    },
    ...restOptions,
  });
};
