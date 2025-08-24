import { useWeddingQuery } from "../common";
import { fetchAllRSVPStatuses } from "../../api/rsvp/rsvpStatusApi";

/**
 * Hook to fetch all RSVP statuses for all invitees
 * @returns Query result with RSVP statuses mapped by invitee ID
 */
export const useRSVPStatuses = () => {
  return useWeddingQuery({
    queryKey: ["rsvpStatuses"],
    queryFn: fetchAllRSVPStatuses,
  });
};
