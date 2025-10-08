import { useWeddingQuery } from "../common";
import { getMessageTemplates } from "../../api/rsvp/rsvpApi";

/**
 * Hook to fetch message templates from Twilio
 * @returns Query result object for message templates
 */
export const useTemplates = () => {
  return useWeddingQuery({
    queryKey: ["templates"],
    queryFn: () => getMessageTemplates(),
  });
};
