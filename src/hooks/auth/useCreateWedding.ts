import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWedding } from "../../api/auth/authApi";

/**
 * Hook to handle wedding creation
 * @returns Mutation result for creating a new wedding
 */
export const useCreateWedding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weddingData: {
      userId: string;
      weddingName: string;
      brideName?: string;
      groomName?: string;
      weddingDate?: Date;
    }) => createWedding(
      weddingData.userId,
      weddingData.weddingName,
      weddingData.brideName,
      weddingData.groomName,
      weddingData.weddingDate
    ),
    onSuccess: () => {
      // Invalidate the currentUser query to refetch user data with the new wedding ID
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
