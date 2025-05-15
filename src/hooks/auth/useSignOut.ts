import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutUser } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";

/**
 * Hook to handle user sign-out
 * @returns Mutation result for user sign-out
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const { setCurrentWeddingId } = useWedding();

  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      // Clear the wedding ID from context
      setCurrentWeddingId(null);

      // Clear the user data from cache when signing out
      queryClient.setQueryData(["currentUser"], null);
      queryClient.setQueryData(["currentUserWeddingId"], null);

      // Also invalidate any wedding-related queries that might contain user-specific data
      queryClient.invalidateQueries();
    },
  });
};
