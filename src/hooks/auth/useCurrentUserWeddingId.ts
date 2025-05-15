import { useQuery } from "@tanstack/react-query";
import { getCurrentUserWeddingId } from "../../api/auth/authApi";

/**
 * Hook to fetch the current user's wedding ID
 * @returns Query result containing the wedding ID
 */
export const useCurrentUserWeddingId = () => {
  return useQuery({
    queryKey: ["currentUserWeddingId"],
    queryFn: getCurrentUserWeddingId,
  });
};
