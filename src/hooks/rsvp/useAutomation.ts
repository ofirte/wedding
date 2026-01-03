import { useWeddingQuery } from "../common";
import { fetchSendAutomation } from "src/api/rsvp/sendAutomationsApi";
import { SendMessagesAutomation } from "@wedding-plan/types";

/**
 * Hook to get a single automation by ID
 * @param automationId - The ID of the automation to retrieve
 * @returns The automation object or undefined if not found
 */
export const useAutomation = (automationId: string | null) => {
  return useWeddingQuery<SendMessagesAutomation | undefined>({
    queryKey: ["automation", automationId],
    queryFn: async (weddingId?: string) => {
      if (!automationId) {
        throw new Error("Automation ID is required to fetch automation");
      }
      return fetchSendAutomation(automationId, weddingId).then(
        (result) => result ?? undefined
      );
    },
    options: {
      enabled: !!automationId, // Only run query if automationId is provided
      staleTime: 5 * 60 * 1000, // 5 minutes - automation status doesn't change frequently
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
    },
  });
};
