import { fetchInvitees } from "../../api/invitees/inviteesApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch invitees data
 * @returns Query result object containing invitees data and query state
 */
export const useInvitees = () => {
  return useWeddingQuery({
    queryKey: ["invitees"],
    queryFn: fetchInvitees,
    // Using refetchOnWindowFocus false as we already have realtime updates through onSnapshot
    options: { refetchOnWindowFocus: false },
  });
};
