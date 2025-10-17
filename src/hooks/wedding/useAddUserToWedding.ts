import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { addUserToWedding } from "../../api/wedding/weddingApi";
import { WeddingPlan } from "@wedding-plan/types";

interface AddUserToWeddingVariables {
  weddingId: string;
  userId: string;
  plan?: WeddingPlan;
  addedBy?: string;
}

/**
 * Hook to add a user to a wedding
 * @param options Optional React Query mutation options
 * @returns Mutation hook for adding users to weddings
 */
export const useAddUserToWedding = (
  options?: Omit<
    UseMutationOptions<void, unknown, AddUserToWeddingVariables, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};
  return useMutation({
    mutationFn: async ({
      weddingId,
      userId,
      plan,
      addedBy,
    }: AddUserToWeddingVariables) => {
      await addUserToWedding(weddingId, userId, plan, addedBy);
    },
    onSuccess: (data, variables) => {
      // Invalidate wedding queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["weddings"] });
      // Also invalidate the specific wedding if it's cached
      queryClient.invalidateQueries({
        queryKey: ["weddingDetails", variables.weddingId],
      });
      onSuccess?.(data, variables, undefined);
    },
    ...restOptions,
  });
};
