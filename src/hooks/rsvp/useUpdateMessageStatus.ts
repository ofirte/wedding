import { useQueryClient } from "@tanstack/react-query";
import { updateMessageStatus, SentMessage } from "../../api/rsvp/rsvpApi";
import { useWeddingMutation } from "../common";

interface UpdateMessageStatusParams {
  messageId: string;
  status: string;
  additionalData?: Partial<
    Pick<SentMessage, "dateSent" | "errorMessage" | "dateUpdated">
  >;
}

/**
 * Hook to update message status in Firebase
 * @returns Mutation object with mutate function to update message status
 */
export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, UpdateMessageStatusParams>({
    mutationFn: (
      { messageId, status }: UpdateMessageStatusParams,
      weddingId?: string
    ) => updateMessageStatus(messageId, status, weddingId),
    options: {
      onSuccess: () => {
        // Invalidate sent messages to refresh the data
        queryClient.invalidateQueries({ queryKey: ["sentMessages"] });
      },
      onError: (error) => {
        console.error("Error updating message status:", error);
      },
    },
  });
};
