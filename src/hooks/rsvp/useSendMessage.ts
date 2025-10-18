import { useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";
import { SendMessageApiRequest } from "@wedding-plan/types";

/**
 * Hook to send a message using Twilio via Firebase Functions
 * @returns Mutation result object for sending messages
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (messageData: SendMessageApiRequest, weddingId?: string) =>
      sendMessage(messageData, weddingId),
    options: {
      onSuccess: () => {
        // Invalidate message logs and sent messages to refresh the data
        queryClient.invalidateQueries({ queryKey: ["messageLogs"] });
        queryClient.invalidateQueries({ queryKey: ["sentMessages"] });
      },
    },
  });
};
