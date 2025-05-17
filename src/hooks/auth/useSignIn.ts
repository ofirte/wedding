import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { signIn } from "../../api/auth/authApi";

/**
 * Hook to handle user sign-in
 * @returns Mutation result for user sign-in
 */
export const useSignIn = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      signIn(credentials.email, credentials.password),
    onSuccess: () => {
      
    },
    ...options
  });
};
