import { useQuery } from "@tanstack/react-query";
import { getWeddingsDetailsBulk } from "../../api/wedding/weddingApi";
import { Wedding } from "@wedding-plan/types";
import { useCurrentUser } from "../auth";

/**
 * Hook to fetch multiple wedding details by their IDs
 * @param weddingIds Array of wedding IDs to fetch
 * @returns Query result containing array of wedding details
 */
export const useWeddingsDetails = (weddingIds?: string[]) => {
  const { data: currentUser } = useCurrentUser();
  const effectiveWeddingIds =
    weddingIds && weddingIds.length > 0
      ? weddingIds
      : currentUser?.weddingIds || [];
  return useQuery({
    queryKey: ["weddings", "multiple", effectiveWeddingIds.sort().join(",")],
    queryFn: async (): Promise<Wedding[]> => {
      return getWeddingsDetailsBulk(effectiveWeddingIds);
    },
    enabled: effectiveWeddingIds && effectiveWeddingIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
