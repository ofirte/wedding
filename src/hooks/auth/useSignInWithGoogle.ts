import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { signInWithGoogle } from "../../api/auth/authApi";

export const useSignInWithGoogle = (
    options?: Omit<UseMutationOptions<unknown, unknown, unknown, unknown>, "mutationFn">
) => {

  return useMutation({
    mutationFn: () => signInWithGoogle(),
    ...options,
  });
};
