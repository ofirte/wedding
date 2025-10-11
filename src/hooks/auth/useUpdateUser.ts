import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi, WeddingUser } from "../../api/auth/authApi";
import { useCurrentUser } from "./useCurrentUser";

interface UpdateUserVariables {
  userId?: string;
  userData: Partial<WeddingUser> | Record<string, any>; // Allow Firestore field values
}

/**
 * Hook to update user data in Firestore
 * @param options Optional React Query mutation options
 * @returns Mutation hook for updating user data
 */
export const useUpdateUser = (
  options?: Omit<
    UseMutationOptions<
      WeddingUser | null,
      unknown,
      UpdateUserVariables,
      unknown
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ userId, userData }: UpdateUserVariables) => {
      const userIdToUse = userId || currentUser?.uid;
      if (!userIdToUse) {
        throw new Error("User ID is required to update user data");
      }
      await authApi.update(userIdToUse, userData);

      // Fetch and return the updated user data
      const updatedUser = await authApi.fetchById(userIdToUse);
      return updatedUser;
    },
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (currentUser && currentUser.uid === variables.userId) {
        queryClient.setQueryData(["currentUser"], updatedUser);
      }
    },
    ...options,
  });
};
