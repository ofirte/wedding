import { useQuery } from "@tanstack/react-query";
import { getCurrentUserData } from "../../api/auth/authApi";

/**
 * Hook to fetch the current authenticated user data
 * @returns Query result containing the current user data and query state
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserData,
    // Don't refetch on window focus as we already listen for auth state changes
    refetchOnWindowFocus: false,
  });
};
