import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { authApi, WeddingUser } from "../../api/auth/authApi";

/**
 * Hook to fetch wedding user details by user ID
 * @param userId The user ID to fetch
 * @param options Optional React Query options
 * @returns Query result with user data and loading/error states
 */
export const useGetWeddingUser = (
  userId: string,
  options?: Omit<
    UseQueryOptions<WeddingUser | null, unknown>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["weddingUser", userId],
    queryFn: () => authApi.fetchById(userId),
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};
