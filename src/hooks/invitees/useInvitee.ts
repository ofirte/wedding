import { useWeddingQuery } from "../common";
import { fetchInvitee } from "../../api/invitees/inviteesApi";

/**
 * Hook to fetch a single invitee data by ID
 * @param inviteeId The ID of the invitee to fetch
 * @returns Query result object containing invitee data and query state
 */
export const useInvitee = (inviteeId: string) => {
  return useWeddingQuery({
    queryKey: ["invitee", inviteeId],
    queryFn: (weddingId) => fetchInvitee(inviteeId, weddingId),
    // Using refetchOnWindowFocus false as we already have realtime updates through onSnapshot
    options: {
      refetchOnWindowFocus: false,
      enabled: !!inviteeId, // Only fetch if inviteeId is provided
    },
  });
};
