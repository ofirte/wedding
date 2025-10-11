import { useAuth } from "./AuthContext";

/**
 * Hook to get the current user's custom claims including admin status
 * @returns User claims from AuthContext
 */
export const useUserClaims = () => {
  const { userClaims, isClaimsLoading } = useAuth();

  return {
    data: userClaims,
    isLoading: isClaimsLoading,
    error: null, // AuthContext handles errors internally
  };
};

/**
 * Hook to check if the current user is an admin
 * @returns Admin status from AuthContext
 */
export const useIsAdmin = () => {
  const { isAdmin, isClaimsLoading } = useAuth();

  return {
    isAdmin,
    isLoading: isClaimsLoading,
    error: null, // AuthContext handles errors internally
  };
};
