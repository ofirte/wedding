import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useUsersInfo, UserInfo } from "./useUsersInfo";

/**
 * Hook to fetch users by their IDs
 * Filters the complete users list to return only specified user IDs
 * @param userIds Array of user IDs to fetch
 * @param options Optional React Query options
 * @returns Query result with filtered users array
 */
export const useUsersByIds = (
  userIds: string[],
  options?: Omit<UseQueryOptions<UserInfo[], unknown>, "queryKey" | "queryFn">
) => {
  const { data: usersResponse } = useUsersInfo({
    enabled: userIds.length > 0,
  });

  return useQuery({
    queryKey: ["usersByIds", userIds],
    queryFn: () => {
      if (!usersResponse?.users) {
        return [];
      }

      // Filter users to only include requested IDs
      return usersResponse.users.filter((user) => userIds.includes(user.uid));
    },
    enabled: !!usersResponse?.users && userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
