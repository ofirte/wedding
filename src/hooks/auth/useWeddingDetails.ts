import { useQuery } from "@tanstack/react-query";
import { getWeddingDetails } from "../../api/auth/authApi";

/**
 * Hook to fetch wedding details
 * @param weddingId The wedding ID to fetch details for
 * @returns Query result containing wedding details
 */
export const useWeddingDetails = (weddingId: string | undefined) => {
  return useQuery({
    queryKey: ["weddingDetails", weddingId],
    queryFn: () => weddingId ? getWeddingDetails(weddingId) : Promise.resolve(null),
    enabled: !!weddingId, // Only run the query if weddingId is present
  });
};
