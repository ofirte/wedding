import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { initializeNewUser } from "../../api/firebaseFunctions";
import { auth } from "../../api/firebaseConfig";
import { InitializeNewUserResponse } from "@wedding-plan/types";

interface InitializeUserVariables {
  userId: string;
  invitationToken?: string;
}

/**
 * Hook to initialize a new user with default role and claims
 * @param options Optional React Query mutation options
 * @returns Mutation hook for initializing user claims
 */
export const useInitializeNewUser = (
  options?: Omit<
    UseMutationOptions<
      InitializeNewUserResponse,
      unknown,
      InitializeUserVariables,
      unknown
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      invitationToken,
    }: InitializeUserVariables) => {
      if (!userId) {
        throw new Error("User ID is required to initialize user");
      }

      const result = await initializeNewUser({
        invitationToken,
      });
      return result.data;
    },
    onSuccess: () => {
      // Invalidate user claims and current user queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["userClaims"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Force token refresh for the initialized user
      // The AuthContext will detect the token change and update claims
      auth.currentUser?.getIdToken(true);
    },
    ...options,
  });
};
