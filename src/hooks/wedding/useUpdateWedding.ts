import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWeddingDetails } from "../../api/wedding/weddingApi";
import { Wedding } from "../../api/wedding/weddingApi";

interface UpdateWeddingParams {
  weddingId: string;
  data: Partial<Wedding>;
}

export const useUpdateWedding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weddingId, data }: UpdateWeddingParams) =>
      updateWeddingDetails(weddingId, data),
    onSuccess: (_, { weddingId }) => {
      // Invalidate and refetch wedding details
      queryClient.invalidateQueries({
        queryKey: ["wedding", weddingId],
      });

      // Also invalidate the current user's wedding details if it's the same wedding
      queryClient.invalidateQueries({
        queryKey: ["currentUserWeddingDetails"],
      });
    },
    onError: (error) => {
      console.error("Failed to update wedding:", error);
    },
  });
};
