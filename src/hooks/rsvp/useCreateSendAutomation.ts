import { useWeddingMutation } from "../common";
import { createSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to create a new send automation
 * @returns Mutation object for creating send automation
 */
export const useCreateSendAutomation = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      automationData: Omit<SendMessagesAutomation, "id">,
      weddingId?: string
    ) => {
      const processedData = { ...automationData };

      // Ensure scheduledTime is stored as UTC for consistent timezone handling
      if (processedData.scheduledTime) {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Keep the exact time - just ensure it's a proper Date object in UTC
        const scheduledTimeUTC = new Date(
          processedData.scheduledTime.getTime()
        );
        processedData.scheduledTimeZone = userTimeZone;
        processedData.scheduledTime = scheduledTimeUTC;
      }

      return createSendAutomation(processedData, weddingId);
    },
    options: {
      onSuccess: () => {
        // Invalidate send automations query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["sendAutomations"] });
        console.log("Send automation created successfully");
      },
    },
  });
};
