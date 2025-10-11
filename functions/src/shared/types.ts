/**
 * Shared types for wedding application backend
 */

/**
 * Wedding role types - defines the hierarchy of permissions within a wedding
 */
export const WeddingRoles = {
  ADMIN: "admin",
  PRODUCER: "producer",
  USER: "user",
} as const;

export type WeddingRole = (typeof WeddingRoles)[keyof typeof WeddingRoles];

/**
 * Wedding plan types
 */
export const WeddingPlans = {
  PAID: "paid",
  FREE: "free",
} as const;

/**
 * Check if a string is a valid wedding role
 */
export const isValidWeddingRole = (role: string): role is WeddingRole => {
  return Object.values(WeddingRoles).includes(role as WeddingRole);
};

/**
 * Get all valid wedding role values as array
 */
export const getValidWeddingRoles = (): WeddingRole[] => {
  return Object.values(WeddingRoles);
};

/**
 * Simplified custom claims structure - no longer stores wedding lists
 */
export interface UserCustomClaims {
  admin?: boolean; // Global admin flag
  role?: WeddingRole; // Default role for new weddings
}
