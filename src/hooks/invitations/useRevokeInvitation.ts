import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeInvitation } from "../../api/firebaseFunctions";
import {
  RevokeInvitationRequest,
  RevokeInvitationResponse,
} from "@wedding-plan/types";

/**
 * Hook to revoke an invitation
 */
export const useRevokeInvitation = (options?: {
  onSuccess?: (data: RevokeInvitationResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RevokeInvitationRequest) => {
      const result = await revokeInvitation(data);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
