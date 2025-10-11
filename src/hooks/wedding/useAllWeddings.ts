import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAllWeddings } from "../../api/wedding/weddingApi";
import { Wedding } from "../../api/wedding/types";

/**
 * Hook to fetch all weddings in the system
 * Only available to admin users
 * @param options Optional React Query options
 * @returns Query result with weddings array and loading/error states
 */
export const useAllWeddings = (
  options?: Omit<UseQueryOptions<Wedding[], unknown>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["weddings", "all"],
    queryFn: getAllWeddings,
    refetchOnWindowFocus: false,
    // Cache for 5 minutes since wedding data doesn't change frequently
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
