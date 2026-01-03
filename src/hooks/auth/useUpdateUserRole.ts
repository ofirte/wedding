import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { setUserRole } from "../../api/firebaseFunctions";
import { WeddingRole } from "@wedding-plan/types";

interface UpdateUserRoleVariables {
  userId: string;
  role: string;
}

interface UpdateUserRoleResponse {
  success: boolean;
  message?: string;
}

/**
 * Hook to update a user's role in the system
 * @param options Optional React Query mutation options
 * @returns Mutation hook for updating user roles
 */
export const useUpdateUserRole = (
  options?: Omit<
    UseMutationOptions<
      UpdateUserRoleResponse,
      unknown,
      UpdateUserRoleVariables,
      unknown
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleVariables) => {
      const result = await setUserRole({ userId, role: role as WeddingRole });
      return result.data as UpdateUserRoleResponse;
    },
    onSuccess: () => {
      // Invalidate user queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userClaims"] });
    },
    ...options,
  });
};
