import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { updateWeddingDetails } from "../../api/wedding/weddingApi";
import { Wedding } from "@wedding-plan/types";

interface UpdateWeddingParams {
  weddingId: string;
  data: Partial<Wedding>;
}

export const useUpdateWedding = (
  options?: Omit<
    UseMutationOptions<void, unknown, UpdateWeddingParams, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weddingId, data }: UpdateWeddingParams) =>
      updateWeddingDetails(weddingId, data),
    onSuccess: (_, { weddingId, data }) => {
      // Invalidate and refetch wedding details
      queryClient.invalidateQueries({
        queryKey: ["wedding", weddingId],
      });

      // Also invalidate the current user's wedding details if it's the same wedding
      queryClient.invalidateQueries({
        queryKey: ["currentUserWeddingDetails"],
      });
      if (options?.onSuccess) {
        options.onSuccess(_, { weddingId, data }, undefined);
      }
    },
    onError: (error) => {
      console.error("Failed to update wedding:", error);
    },
  });
};
