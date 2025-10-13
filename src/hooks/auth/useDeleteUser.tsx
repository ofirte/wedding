import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { deleteUserAccount } from "../../api/auth/authApi";
export type deleteUserMutationResponse = {
  success: boolean;
  message: string;
  userId: string;
};
export const useDeleteUser = (
  options: Omit<
    UseMutationOptions<deleteUserMutationResponse, Error, string>,
    "mutationFn"
  > = {}
) => {
  return useMutation({
    mutationFn: deleteUserAccount,
    ...options,
  });
};
