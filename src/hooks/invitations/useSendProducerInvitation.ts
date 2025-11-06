import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendProducerInvitation } from "../../api/firebaseFunctions";
import {
  SendProducerInvitationRequest,
  SendProducerInvitationResponse,
} from "@wedding-plan/types";

/**
 * Hook to send a producer invitation
 */
export const useSendProducerInvitation = (options?: {
  onSuccess?: (data: SendProducerInvitationResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendProducerInvitationRequest) => {
      const result = await sendProducerInvitation(data);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
