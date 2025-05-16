import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { createWedding } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";
import { getCurrentUserData } from "../../api/auth/authApi";

/**
 * Hook to handle wedding creation
 * @returns Mutation result for creating a new wedding
 */
export const useCreateWedding = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
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
    onSuccess: async (weddingId, variables, context) => {
      setCurrentWeddingId(weddingId as string);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      const userData = await getCurrentUserData();
      if (userData?.weddingId) {
        queryClient.setQueryData(["currentUserWeddingId"], userData.weddingId);
      }
      options?.onSuccess?.(weddingId, variables, context);
    },
    ...options,
  });
};
