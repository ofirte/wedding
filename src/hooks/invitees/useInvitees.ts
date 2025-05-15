// filepath: /Users/ofirtene/Projects/wedding-plan/src/hooks/invitees/useInvitees.ts
import { useQuery } from "@tanstack/react-query";
import { fetchInvitees } from "../../api/invitees/inviteesApi";

/**
 * Hook to fetch invitees data
 * @returns Query result object containing invitees data and query state
 */
export const useInvitees = () => {
  return useQuery({
    queryKey: ["invitees"],
    queryFn: fetchInvitees,
    // Using refetchOnWindowFocus false as we already have realtime updates through onSnapshot
    refetchOnWindowFocus: false,
  });
};
