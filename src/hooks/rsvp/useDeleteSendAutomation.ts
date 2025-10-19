import { useWeddingMutation } from "../common";
import { deleteSendAutomation } from "../../api/rsvp/sendAutomationsApi";

/**
 * Hook to delete a send automation
 * @returns Mutation object for deleting send automation
 */
export const useDeleteSendAutomation = () => {
  return useWeddingMutation({
    mutationFn: (automationId: string, weddingId?: string) =>
      deleteSendAutomation(automationId, weddingId),
    options: {
      onSuccess: () => {
        console.log("Send automation deleted successfully");
      },
    },
  });
};
