import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUp } from "../../api/auth/authApi";

/**
 * Hook to handle user sign-up
 * @returns Mutation result for user sign-up
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: { email: string; password: string; displayName?: string }) => 
      signUp(userData.email, userData.password, userData.displayName),
    onSuccess: () => {
      // Invalidate the currentUser query to refetch user data after sign-up
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
