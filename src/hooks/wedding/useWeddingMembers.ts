import { useQuery } from "@tanstack/react-query";
import { useWeddingDetails } from "./useWeddingDetails";
import { authApi } from "../../api/auth/authApi";

export interface WeddingMemberWithDetails {
  userId: string;
  email: string;
  displayName?: string;
  addedAt: string;
  addedBy: string;
}

/**
 * Hook to fetch wedding members with their user details
 * @param weddingId Optional wedding ID (uses current wedding if not provided)
 * @returns Query result with array of wedding members with user details
 */
export const useWeddingMembers = (weddingId?: string) => {
  const { data: wedding } = useWeddingDetails(weddingId);

  return useQuery({
    queryKey: ["weddingMembers", weddingId || wedding?.id],
    queryFn: async () => {
      if (!wedding?.members) {
        return [];
      }

      // Get all user IDs from wedding members
      const memberIds = Object.keys(wedding.members);

      // Fetch user details for each member
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

      const members = await Promise.all(memberDetailsPromises);
      return members;
    },
    enabled: !!wedding?.members && Object.keys(wedding.members).length > 0,
  });
};
