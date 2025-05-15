import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWedding } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";
import { getCurrentUserData } from "../../api/auth/authApi";

/**
 * Hook to handle wedding creation
 * @returns Mutation result for creating a new wedding
 */
export const useCreateWedding = () => {
  const queryClient = useQueryClient();
  const { setCurrentWeddingId } = useWedding();

  return useMutation({
    mutationFn: (weddingData: {
      userId: string;
      weddingName: string;
      brideName?: string;
      groomName?: string;
      weddingDate?: Date;
    }) =>
      createWedding(
        weddingData.userId,
        weddingData.weddingName,
        weddingData.brideName,
        weddingData.groomName,
        weddingData.weddingDate
      ),
    onSuccess: async (weddingId) => {
      // Set the wedding ID in our context
      setCurrentWeddingId(weddingId);

      // Invalidate the currentUser query to refetch user data with the new wedding ID
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Update the wedding ID in query cache
      const userData = await getCurrentUserData();
      if (userData?.weddingId) {
        queryClient.setQueryData(["currentUserWeddingId"], userData.weddingId);
      }
    },
  });
};
