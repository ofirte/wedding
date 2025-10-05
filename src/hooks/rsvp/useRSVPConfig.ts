import { useQuery } from "@tanstack/react-query";
import { getRSVPConfig } from "../../api/rsvp/rsvpQuestionsApi";
import { useCurrentUserWeddingId } from "../auth/useCurrentUserWeddingId";

// Query keys
export const rsvpKeys = {
  all: ["rsvp"] as const,
  config: (weddingId: string) =>
    [...rsvpKeys.all, "config", weddingId] as const,
};

/**
 * Hook to get RSVP configuration
 */
export const useRSVPConfig = (weddingId?: string) => {
  const { data: currentWeddingId } = useCurrentUserWeddingId();
  const resolvedWeddingId = weddingId || currentWeddingId || undefined;

  return useQuery({
    queryKey: rsvpKeys.config(resolvedWeddingId || ""),
    queryFn: () => getRSVPConfig(resolvedWeddingId),
    enabled: !!resolvedWeddingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
