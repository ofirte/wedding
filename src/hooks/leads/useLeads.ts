import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../../api/leads/leadsApi";

/**
 * Hook to fetch all leads for the current producer
 * @returns Query result object containing leads data and query state
 */
export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false,
  });
};
