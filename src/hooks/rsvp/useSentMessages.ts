import { getSentMessages, SentMessage } from "../../api/rsvp/rsvpApi";
import { useWeddingQuery } from "../common";

export const useSentMessages = () => {
  return useWeddingQuery<SentMessage[]>({
    queryKey: ["sentMessages"],
    queryFn: (weddingId) => getSentMessages(weddingId),
    options: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  });
};
