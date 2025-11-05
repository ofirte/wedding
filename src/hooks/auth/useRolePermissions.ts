import { useMemo } from "react";
import { Roles, Role } from "@wedding-plan/types";
import { useCurrentUser } from "./useCurrentUser";

/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY = {
  [Roles.USER]: 1,
  [Roles.PRODUCER]: 2,
  [Roles.ADMIN]: 3,
} as const;

/**
 * Check if a role has access level for a specific permission tier
 */
const hasRoleAccess = (
  userRole: Role | string | undefined,
  requiredRole: Role
): boolean => {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole as Role] || 0;
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
  const { data: user } = useCurrentUser();

  return useMemo(() => {
    const role = user?.role;
    return {
      hasUserAccess: hasRoleAccess(role, Roles.USER),
      hasProducerAccess: hasRoleAccess(role, Roles.PRODUCER),
      hasAdminAccess: hasRoleAccess(role, Roles.ADMIN),
    };
  }, [user?.role]);
};
