import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { signUp } from "../../api/auth/authApi";

export const useSignUp = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: {
      email: string;
      password: string;
      displayName?: string;
    }) => signUp(userData.email, userData.password, userData.displayName),
    onSuccess: (data, variables, context) => {
      // Invalidate the currentUser query to refetch user data after sign-up
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      options?.onSuccess?.(data, variables, context)
    },  
    ...options
  });
};
