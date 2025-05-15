import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinWedding } from "../../api/auth/authApi";

/**
 * Hook to handle joining an existing wedding
 * @returns Mutation result for joining a wedding
 */
export const useJoinWedding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; weddingId: string }) =>
      joinWedding(params.userId, params.weddingId),
    onSuccess: () => {
      // Invalidate the currentUser query to refetch user data with the updated wedding ID
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
