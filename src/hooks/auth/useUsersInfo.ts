import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { listUsers } from "../../api/firebaseFunctions";

export interface UserInfo {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastSignInAt?: string;
  role: string;
}

interface UsersInfoResponse {
  success: boolean;
  users: UserInfo[];
  totalCount: number;
}

/**
 * Hook to fetch all users with their roles and information
 * Only available to admin users
 * @param options Optional React Query options
 * @returns Query result with users array and loading/error states
 */
export const useUsersInfo = (
  options?: Omit<
    UseQueryOptions<UsersInfoResponse, unknown>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["usersInfo"],
    queryFn: async () => {
      const result = await listUsers();
      return result.data as UsersInfoResponse;
    },
    refetchOnWindowFocus: false,
    // Only refetch when explicitly requested since user data doesn't change frequently
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
