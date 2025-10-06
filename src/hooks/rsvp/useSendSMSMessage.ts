import { useQueryClient } from "@tanstack/react-query";
import {
  sendSMSMessage,
  SendSMSRequest,
  SendSMSResponse,
} from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to send SMS messages using Twilio
 * Converts WhatsApp templates to SMS format
 */
export const useSendSMSMessage = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<SendSMSResponse, SendSMSRequest>({
    mutationFn: (messageData: SendSMSRequest, weddingId?: string) =>
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
