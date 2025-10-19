import { useWeddingMutation } from "../common";
import { createSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * Hook to create a new send automation
 * @returns Mutation object for creating send automation
 */
export const useCreateSendAutomation = () => {
  return useWeddingMutation({
    mutationFn: (automationData: Omit<SendMessagesAutomation, "id">, weddingId?: string) =>
      createSendAutomation(automationData, weddingId),
    options: {
      onSuccess: () => {
        // You can add success handling here if needed
        console.log("Send automation created successfully");
      },
    },
  });
};