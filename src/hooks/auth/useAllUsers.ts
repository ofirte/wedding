import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { authApi, WeddingUser } from "../../api/auth/authApi";

/**
 * Hook to fetch all users in the system
 * @param options Optional React Query options
 * @returns Query result with users array and loading/error states
 */
export const useAllUsers = (
  options?: Omit<
    UseQueryOptions<WeddingUser[], unknown>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => authApi.fetchAll(),
    refetchOnWindowFocus: false,
    ...options,
  });
};
