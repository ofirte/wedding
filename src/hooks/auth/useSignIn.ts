import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "../../api/auth/authApi";

/**
 * Hook to handle user sign-in
 * @returns Mutation result for user sign-in
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      signIn(credentials.email, credentials.password),
    onSuccess: () => {
      // Invalidate the currentUser query to refetch user data after sign-in
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
