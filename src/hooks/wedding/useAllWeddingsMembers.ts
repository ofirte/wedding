import { useQueries } from "@tanstack/react-query";
import { authApi } from "../../api/auth/authApi";
import { useWeddingsDetails } from "./useWeddingsDetails";
import { WeddingMemberWithDetails } from "./useWeddingMembers";

/**
 * Hook to fetch wedding members for all weddings a producer has access to
 * @returns Query result with a map of weddingId -> WeddingMemberWithDetails[]
 */
export const useAllWeddingsMembers = () => {
  const { data: weddings = [] } = useWeddingsDetails();

  const memberQueries = useQueries({
    queries: weddings.map((wedding) => ({
      queryKey: ["weddingMembers", wedding.id],
      queryFn: async (): Promise<WeddingMemberWithDetails[]> => {
        if (!wedding.members) {
          return [];
        }

        const memberIds = Object.keys(wedding.members);

        const memberDetailsPromises = memberIds.map(async (userId) => {
          try {
            const userData = await authApi.fetchById(userId);
            return {
              userId,
              email: userData?.email || "Unknown",
              displayName: userData?.displayName || userData?.email || "Unknown",
              addedAt: wedding.members![userId].addedAt,
              addedBy: wedding.members![userId].addedBy,
            } as WeddingMemberWithDetails;
          } catch (error) {
            console.error(`Error fetching user details for ${userId}:`, error);
            return {
              userId,
              email: "Unknown",
              displayName: "Unknown User",
              addedAt: wedding.members![userId].addedAt,
              addedBy: wedding.members![userId].addedBy,
            } as WeddingMemberWithDetails;
          }
        });

        return Promise.all(memberDetailsPromises);
      },
      enabled: !!wedding.members && Object.keys(wedding.members).length > 0,
    })),
  });

  // Build the map of weddingId -> members
  const weddingMembersMap: Record<string, WeddingMemberWithDetails[]> = {};
  weddings.forEach((wedding, index) => {
    const queryResult = memberQueries[index];
    if (queryResult?.data) {
      weddingMembersMap[wedding.id] = queryResult.data;
    }
  });

  const isLoading = memberQueries.some((q) => q.isLoading);
  const isError = memberQueries.some((q) => q.isError);

  return {
    data: weddingMembersMap,
    isLoading,
    isError,
  };
};
