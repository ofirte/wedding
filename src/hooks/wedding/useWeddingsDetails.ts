import { useQuery } from "@tanstack/react-query";
import { getWeddingDetails } from "../../api/wedding/weddingApi";
import { Wedding } from "../../api/wedding/types";

/**
 * Hook to fetch multiple wedding details by their IDs
 * @param weddingIds Array of wedding IDs to fetch
 * @returns Query result containing array of wedding details
 */
export const useWeddingsDetails = (weddingIds: string[] = []) => {
  return useQuery({
    queryKey: ["weddings", "multiple", weddingIds.sort().join(",")],
    queryFn: async (): Promise<Wedding[]> => {
      if (!weddingIds || weddingIds.length === 0) {
        return [];
      }

      // Fetch all weddings in parallel
      const weddingPromises = weddingIds.map(async (weddingId) => {
        try {
          const wedding = await getWeddingDetails(weddingId);
          return wedding;
        } catch (error) {
          console.error(`Error fetching wedding ${weddingId}:`, error);
          return null;
        }
      });

      const weddings = await Promise.all(weddingPromises);

      // Filter out null results (failed fetches) and ensure type safety
      return weddings.filter((wedding): wedding is Wedding => wedding !== null);
    },
    enabled: weddingIds && weddingIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
