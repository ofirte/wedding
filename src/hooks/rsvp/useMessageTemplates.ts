import {
  getMessageTemplates,
  MessageTemplatesResponse,
} from "../../api/rsvp/rsvpApi";
import { useWeddingQuery } from "../common";

export const useMessageTemplates = () => {
  return useWeddingQuery<MessageTemplatesResponse>({
    queryKey: ["messageTemplates"],
    queryFn: () => getMessageTemplates(),
    options: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  });
};
