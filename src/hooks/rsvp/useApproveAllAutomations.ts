import { useQueryClient } from "@tanstack/react-query";
import { useWeddingMutation } from "../common";
import { updateSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import { rsvpConfigAPI } from "../../api/rsvp/rsvpQuestionsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";

interface ApproveAllAutomationsParams {
  automations: SendMessagesAutomation[];
  rsvpConfigId: string;
}

/**
 * Hook to approve all automations at once and mark automation setup as complete
 * @returns Mutation object for bulk approving automations
 */
export const useApproveAllAutomations = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: async (
      { automations, rsvpConfigId }: ApproveAllAutomationsParams,
      weddingId?: string
    ) => {
      // Update all automations to isActive: true in parallel
      await Promise.all(
        automations.map((automation) =>
          updateSendAutomation(automation.id, { isActive: true }, weddingId)
        )
      );

      // Mark automation setup as complete
      await rsvpConfigAPI.update(
        rsvpConfigId,
        { isAutomationSetupComplete: true },
        weddingId
      );
    },
    options: {
      onSuccess: () => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["sendAutomations"] });
        queryClient.invalidateQueries({ queryKey: ["rsvpConfig"] });
      },
    },
  });
};
