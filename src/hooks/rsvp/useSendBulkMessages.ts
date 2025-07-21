import { useQueryClient } from "@tanstack/react-query";
import { sendBulkMessages, SendMessageRequest } from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to send multiple messages in bulk using Twilio via Firebase Functions
 * @returns Mutation result object for sending bulk messages
 */
export const useSendBulkMessages = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (messages: SendMessageRequest[], weddingId?: string) =>
      sendBulkMessages(messages, weddingId),
    options: {
      onSuccess: () => {
        // Invalidate message logs and sent messages to refresh the data
        queryClient.invalidateQueries({ queryKey: ["messageLogs"] });
        queryClient.invalidateQueries({ queryKey: ["sentMessages"] });
      },
    },
  });
};
