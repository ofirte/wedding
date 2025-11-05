import { useMemo } from "react";
import { WeddingRole, WeddingRoles } from "@wedding-plan/types";
import { useCurrentUser } from "./useCurrentUser";
import { useAuth } from "./AuthContext";

/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY = {
  [WeddingRoles.USER]: 1,
  [WeddingRoles.PRODUCER]: 2,
  [WeddingRoles.ADMIN]: 3,
} as const;

/**
 * Check if a role has access level for a specific permission tier
 */
const hasRoleAccess = (
  userRole: WeddingRole | string | undefined,
  requiredRole: WeddingRole
): boolean => {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole as WeddingRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Hook to get hierarchical role permissions for the current user
 *
 * @returns Object with three permission flags:
 * - hasUserAccess: true for user, producer, and admin roles
 * - hasProducerAccess: true for producer and admin roles
 * - hasAdminAccess: true for admin role only
 */
export const useRolePermissions = () => {
  const { userClaims } = useAuth();

  return useMemo(() => {
    const role = userClaims?.role;
    return {
      hasUserAccess: hasRoleAccess(role, WeddingRoles.USER),
      hasProducerAccess: hasRoleAccess(role, WeddingRoles.PRODUCER),
      hasAdminAccess: hasRoleAccess(role, WeddingRoles.ADMIN),
    };
  }, [userClaims?.role]);
};
