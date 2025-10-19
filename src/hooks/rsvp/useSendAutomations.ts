import { useWeddingQuery } from "../common";
import { fetchSendAutomations } from "../../api/rsvp/sendAutomationsApi";

/**
 * Hook to fetch all send automations for a wedding
 * @returns Query result object for send automations
 */
export const useSendAutomations = () => {
  return useWeddingQuery({
    queryKey: ["sendAutomations"],
    queryFn: (weddingId) => fetchSendAutomations(weddingId),
  });
};