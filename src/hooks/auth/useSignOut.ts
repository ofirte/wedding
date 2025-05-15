import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutUser } from "../../api/auth/authApi";

/**
 * Hook to handle user sign-out
 * @returns Mutation result for user sign-out
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      // Clear the user data from cache when signing out
      queryClient.setQueryData(["currentUser"], null);
      // Also invalidate any wedding-related queries that might contain user-specific data
      queryClient.invalidateQueries();
    },
  });
};
