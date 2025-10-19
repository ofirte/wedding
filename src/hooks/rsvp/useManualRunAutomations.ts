import { useMutation } from "@tanstack/react-query";
import { manualRunMessagesAutomation } from "../../api/firebaseFunctions/sendAutomations";

/**
 * Hook to manually trigger message automations
 * @returns Mutation object for manually running automations
 */
export const useManualRunAutomations = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await manualRunMessagesAutomation({});
      return result.data;
    },
    onSuccess: (data) => {
      console.log("Manual automation run completed:", data);
      // You can add a toast notification here if you have a notification system
    },
    onError: (error) => {
      console.error("Failed to run automations manually:", error);
      // You can add an error toast notification here
    },
  });
};