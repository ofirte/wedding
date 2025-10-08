import { useWeddingQuery } from "../common";
import { getWeddingTemplates } from "../../api/rsvp/templateApi";

/**
 * Hook to fetch combined templates from both Twilio and Firebase
 * Returns only templates that exist in both sources (intersection)
 * @returns Query result object for combined templates
 */
export const useTemplates = () => {
  return useWeddingQuery({
    queryKey: ["templates", "combined"],
    queryFn: (weddingId) => getWeddingTemplates(weddingId),
  });
};
