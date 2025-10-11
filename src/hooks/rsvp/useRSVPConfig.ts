import { getRSVPConfig } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to get RSVP configuration
 */
export const useRSVPConfig = () => {
  return useWeddingQuery({
    queryKey: ["rsvpConfig"],
    queryFn: getRSVPConfig,
  });
};
