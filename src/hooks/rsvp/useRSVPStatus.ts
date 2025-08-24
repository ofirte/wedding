import { useQuery } from "@tanstack/react-query";
import { getRSVPStatus } from "../../api/rsvp/rsvpStatusApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch RSVP status for an invitee
 * @param inviteeId The ID of the invitee to fetch RSVP status for
 * @returns Query result object containing RSVP status data and query state
 */
export const useRSVPStatus = (inviteeId: string) => {
  return useWeddingQuery({
    queryKey: ["rsvpStatus", inviteeId],
    queryFn: (weddingId) => getRSVPStatus(inviteeId, weddingId),
    options: {
      refetchOnWindowFocus: false,
      // Enable query only if inviteeId is provided
      enabled: !!inviteeId,
    },
  });
};
