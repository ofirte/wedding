import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  joinWedding,
  getCurrentUserData,
} from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";

export const useJoinWedding = (
  options?: UseMutationOptions<unknown, unknown, unknown, unknown>
) => {
  const queryClient = useQueryClient();
  const { setCurrentWeddingId } = useWedding();

  return useMutation({
    mutationFn: (params: { userId: string; weddingId: string }) =>
      joinWedding(params.userId, params.weddingId),
    onSuccess: async (data, params, context) => {
      setCurrentWeddingId(params.weddingId);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      const userData = await getCurrentUserData();
      if (userData?.weddingId) {
        queryClient.setQueryData(["currentUserWeddingId"], userData.weddingId);
      }
      options?.onSuccess?.(data, params, context);
    },
  });
};
