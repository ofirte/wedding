import { useQueryClient } from "@tanstack/react-query";
import { sendMessage, SendMessageRequest } from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to send a message using Twilio via Firebase Functions
 * @returns Mutation result object for sending messages
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (messageData: SendMessageRequest, weddingId?: string) =>
      sendMessage(messageData, weddingId),
    options: {
      onSuccess: () => {
        // Invalidate message logs to refresh the data
        queryClient.invalidateQueries({ queryKey: ["messageLogs"] });
      },
    },
  });
};
