import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { signUp, WeddingUser } from "../../api/auth/authApi";
interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export const useSignUp = (
  options?: Omit<
    UseMutationOptions<WeddingUser, unknown, SignUpData, unknown>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: (userData: SignUpData) =>
      signUp(userData.email, userData.password, userData.displayName),
    ...options,
  });
};
