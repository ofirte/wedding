import { useQuery } from "@tanstack/react-query";
import { fetchLeadEvents } from "../../api/leads/leadsApi";

/**
 * Hook to fetch events (activity log) for a specific lead
 * @param leadId The ID of the lead to fetch events for
 * @param enabled Whether to enable the query (default: true)
 * @returns Query result object containing lead events data and query state
 */
export const useLeadEvents = (leadId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["leadEvents", leadId],
    queryFn: () => fetchLeadEvents(leadId),
    enabled: !!leadId && enabled,
    refetchOnWindowFocus: false,
  });
};
