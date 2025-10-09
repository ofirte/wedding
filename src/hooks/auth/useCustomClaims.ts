import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  setUserCustomClaims,
  removeUserCustomClaims,
  getUserCustomClaims,
  findUserByEmail,
  addUserToWedding,
  refreshUserToken,
  SetCustomClaimsData,
  RemoveCustomClaimsData,
  CustomClaimsResponse,
  FindUserResponse,
} from "../../api/auth/customClaimsApi";

/**
 * Hook to set custom claims for a user
 */
export const useSetCustomClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetCustomClaimsData) => setUserCustomClaims(data),
    onSuccess: async (data: CustomClaimsResponse) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customClaims"] });
      queryClient.invalidateQueries({ queryKey: ["wedding", data.weddingId] });

      // Refresh user token to get updated claims
      try {
        await refreshUserToken();
      } catch (error) {
        console.warn("Failed to refresh user token:", error);
      }
    },
  });
};

/**
 * Hook to remove custom claims for a user
 */
export const useRemoveCustomClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveCustomClaimsData) => removeUserCustomClaims(data),
    onSuccess: async (data: CustomClaimsResponse) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customClaims"] });
      queryClient.invalidateQueries({ queryKey: ["wedding", data.weddingId] });

      // Refresh user token to get updated claims
      try {
        await refreshUserToken();
      } catch (error) {
        console.warn("Failed to refresh user token:", error);
      }
    },
  });
};

/**
 * Hook to get user's custom claims
 */
export const useCustomClaims = (userId?: string) => {
  return useQuery({
    queryKey: ["customClaims", userId],
    queryFn: () => getUserCustomClaims(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to find user by email
 */
export const useFindUserByEmail = () => {
  return useMutation({
    mutationFn: (email: string) => findUserByEmail(email),
  });
};

/**
 * Hook to add user to wedding by email
 */
export const useAddUserToWedding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      weddingId,
      role,
    }: {
      email: string;
      weddingId: string;
      role?: "bride" | "groom" | "admin";
    }) => addUserToWedding(email, weddingId, role),
    onSuccess: async (data: FindUserResponse) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customClaims"] });
      queryClient.invalidateQueries({ queryKey: ["wedding", data.weddingId] });

      // Refresh user token if the current user was added to a wedding
      try {
        await refreshUserToken();
      } catch (error) {
        console.warn("Failed to refresh user token:", error);
      }
    },
  });
};

/**
 * Hook to update user's role in a wedding
 */
export const useUpdateUserWeddingRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      weddingId,
      role,
    }: {
      userId: string;
      weddingId: string;
      role: "bride" | "groom" | "admin";
    }) => setUserCustomClaims({ userId, weddingId, role }),
    onSuccess: async (data: CustomClaimsResponse) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customClaims"] });
      queryClient.invalidateQueries({ queryKey: ["wedding", data.weddingId] });

      // Refresh user token to get updated claims
      try {
        await refreshUserToken();
      } catch (error) {
        console.warn("Failed to refresh user token:", error);
      }
    },
  });
};

/**
 * Hook to remove user from wedding
 */
export const useRemoveUserFromWedding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      weddingId,
    }: {
      userId: string;
      weddingId: string;
    }) => removeUserCustomClaims({ userId, weddingId }),
    onSuccess: async (data: CustomClaimsResponse) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customClaims"] });
      queryClient.invalidateQueries({ queryKey: ["wedding", data.weddingId] });

      // Refresh user token to get updated claims
      try {
        await refreshUserToken();
      } catch (error) {
        console.warn("Failed to refresh user token:", error);
      }
    },
  });
};
