import { useQuery } from "@tanstack/react-query";
import { getWeddingDetails } from "../../api/auth/authApi";
import { useWedding } from "../../context/WeddingContext";

/**
 * Hook to fetch wedding details
 * @param weddingId The wedding ID to fetch details for
 * @returns Query result containing wedding details
 */
export const useWeddingDetails = (weddingId?: string | undefined) => {
  const { currentWeddingId } = useWedding();
  const weddingIdToUse = weddingId || currentWeddingId;
  return useQuery({
    queryKey: ["weddingDetails", weddingId],
    queryFn: () =>
      weddingIdToUse
        ? getWeddingDetails(weddingIdToUse)
        : Promise.resolve(null),
    enabled: !!weddingIdToUse, // Only run the query if weddingId is present
  });
};
