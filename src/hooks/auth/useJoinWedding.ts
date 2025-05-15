import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinWedding, getCurrentUserData } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";

/**
 * Hook to handle joining an existing wedding
 * @returns Mutation result for joining a wedding
 */
export const useJoinWedding = () => {
  const queryClient = useQueryClient();
  const { setCurrentWeddingId } = useWedding();

  return useMutation({
    mutationFn: (params: { userId: string; weddingId: string }) =>
      joinWedding(params.userId, params.weddingId),
    onSuccess: async (_, params) => {
      // Set the wedding ID in our context
      setCurrentWeddingId(params.weddingId);

      // Invalidate the currentUser query to refetch user data with the updated wedding ID
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Update the wedding ID in query cache
      const userData = await getCurrentUserData();
      if (userData?.weddingId) {
        queryClient.setQueryData(["currentUserWeddingId"], userData.weddingId);
      }
    },
  });
};
