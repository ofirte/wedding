import { useQuery } from "@tanstack/react-query";
import { userHasWedding } from "../../api/auth/authApi";

/**
 * Hook to check if a user has an associated wedding
 * @param userId The user ID to check
 * @returns Query result indicating whether the user has a wedding
 */
export const useUserHasWedding = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userHasWedding", userId],
    queryFn: () => userId ? userHasWedding(userId) : Promise.resolve(false),
    enabled: !!userId, // Only run the query if userId is present
  });
};
