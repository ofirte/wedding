import { useWeddingMutation } from "../common";
import { updateSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * Hook to update an existing send automation
 * @returns Mutation object for updating send automation
 */
export const useUpdateSendAutomation = () => {
  return useWeddingMutation({
    mutationFn: (
      { id, ...updates }: { id: string } & Partial<SendMessagesAutomation>,
      weddingId?: string
    ) => updateSendAutomation(id, updates, weddingId),
    options: {
      onSuccess: () => {
        console.log("Send automation updated successfully");
      },
    },
  });
};