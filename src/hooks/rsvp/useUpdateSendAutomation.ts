import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useWeddingMutation } from "../common";
import { updateSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * Hook to update an existing send automation
 * @returns Mutation object for updating send automation
 */
export const useUpdateSendAutomation = (
  options?:
    | Omit<
        UseMutationOptions<
          void,
          unknown,
          {
            id: string;
          } & Partial<SendMessagesAutomation>,
          unknown
        >,
        "mutationFn"
      >
    | undefined
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      { id, ...updates }: { id: string } & Partial<SendMessagesAutomation>,
      weddingId?: string
    ) => {
      if (updates.scheduledTime !== undefined) {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const scheduledTimeUTC = new Date(updates.scheduledTime.toISOString());
        updates.scheduledTimeZone = userTimeZone;
        updates.scheduledTime = scheduledTimeUTC;
      }
      return updateSendAutomation(id, updates, weddingId);
    },
    options: {
      onSuccess: (_data, _variables, _context) => {
        // Invalidate send automations query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["sendAutomations"] });
        options?.onSuccess?.(_data, _variables, _context);
        console.log("Send automation updated successfully");
      },
    },
  });
};
