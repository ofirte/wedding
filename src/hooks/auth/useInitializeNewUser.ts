import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { initializeNewUser } from "../../api/firebaseFunctions";
import { auth } from "../../api/firebaseConfig";

interface InitializeUserVariables {
  userId: string;
}

export interface InitializeUserResponse {
  success: boolean;
  message: string;
  userId: string;
}

/**
 * Hook to initialize a new user with default role and claims
 * @param options Optional React Query mutation options
 * @returns Mutation hook for initializing user claims
 */
export const useInitializeNewUser = (
  options?: Omit<
    UseMutationOptions<
      InitializeUserResponse,
      unknown,
      InitializeUserVariables,
      unknown
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: InitializeUserVariables) => {
      if (!userId) {
        throw new Error("User ID is required to initialize user");
      }

      const result = await initializeNewUser({ uid: userId });
      return result.data as InitializeUserResponse;
    },
    onSuccess: (data, variables) => {
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
