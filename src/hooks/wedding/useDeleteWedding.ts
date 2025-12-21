import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteWedding } from "../../api/wedding/weddingApi";

// @TODO: not ready, should be soft delete, and handle maybe removing wedding from users who are members
export const useDeleteWedding = (
  options?: Omit<UseMutationOptions<void, unknown, string, unknown>, "mutationFn">
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (weddingId: string) => deleteWedding(weddingId),
    onSuccess: (data, weddingId, _onMutateResults, _context) => {
      // Invalidate all wedding-related queries
      queryClient.invalidateQueries({ queryKey: ["weddings"] });
      queryClient.invalidateQueries({
        queryKey: ["weddingDetails", weddingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["wedding", weddingId],
      });
      onSuccess?.(data, weddingId, _onMutateResults, _context);
    },
    ...restOptions,
  });
};
