import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { signOutUser } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";

/**
 * Hook to handle user sign-out
 * @returns Mutation result for user sign-out
 */
export const useSignOut = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { setCurrentWeddingId } = useWedding();

  return useMutation({
    mutationFn: signOutUser,
    onSuccess: (data, variables, context) => {
      setCurrentWeddingId(null);
      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["currentUserWeddingId"], null);
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
