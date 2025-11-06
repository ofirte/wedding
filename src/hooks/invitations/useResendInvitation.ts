import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendInvitation } from "../../api/firebaseFunctions";
import {
  ResendInvitationRequest,
  ResendInvitationResponse,
} from "@wedding-plan/types";

/**
 * Hook to resend an invitation
 */
export const useResendInvitation = (options?: {
  onSuccess?: (data: ResendInvitationResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResendInvitationRequest) => {
      const result = await resendInvitation(data);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
