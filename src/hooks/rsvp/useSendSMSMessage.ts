import { useQueryClient } from "@tanstack/react-query";
import {
  sendSMSMessage,
  SendMessageApiRequest,
  SentMessage
} from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to send SMS messages using Twilio
 * Converts WhatsApp templates to SMS format
 */
export const useSendSMSMessage = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<SentMessage, SendMessageApiRequest>({
    mutationFn: (messageData: SendMessageApiRequest, weddingId?: string) =>
      sendSMSMessage(messageData, weddingId),
    options: {
      onSuccess: () => {
        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["messageLogs"] });
        queryClient.invalidateQueries({ queryKey: ["sentMessages"] });
      },
      onError: (error) => {
        console.error("Error sending SMS:", error);
      },
    },
  });
};
