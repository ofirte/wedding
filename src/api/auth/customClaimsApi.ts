import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";

// Custom claims function references
const setUserCustomClaimsFunction = httpsCallable(
  functions,
  "setUserCustomClaims"
);
const removeUserCustomClaimsFunction = httpsCallable(
  functions,
  "removeUserCustomClaims"
);
const getUserCustomClaimsFunction = httpsCallable(
  functions,
  "getUserCustomClaims"
);
const findUserByEmailFunction = httpsCallable(functions, "findUserByEmail");

export interface SetCustomClaimsData {
  userId: string;
  weddingId: string;
  role?: "bride" | "groom" | "admin";
}

export interface RemoveCustomClaimsData {
  userId: string;
  weddingId: string;
}

export interface CustomClaimsResponse {
  success: boolean;
  message?: string;
  userId?: string;
  weddingId?: string;
  role?: string;
  customClaims?: any;
}

export interface FindUserResponse {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  addedToWedding?: boolean;
  weddingId?: string;
  role?: string;
}

/**
 * Set custom claims for a user (add them to a wedding)
 */
export const setUserCustomClaims = async (
  data: SetCustomClaimsData
): Promise<CustomClaimsResponse> => {
  try {
    const result = await setUserCustomClaimsFunction(data);
    return result.data as CustomClaimsResponse;
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
};

/**
 * Remove custom claims for a user (remove them from a wedding)
 */
export const removeUserCustomClaims = async (
  data: RemoveCustomClaimsData
): Promise<CustomClaimsResponse> => {
  try {
    const result = await removeUserCustomClaimsFunction(data);
    return result.data as CustomClaimsResponse;
  } catch (error) {
    console.error("Error removing custom claims:", error);
    throw error;
  }
};

/**
 * Get custom claims for a user
 */
export const getUserCustomClaims = async (
  userId?: string
): Promise<CustomClaimsResponse> => {
  try {
    const result = await getUserCustomClaimsFunction({ userId });
    return result.data as CustomClaimsResponse;
  } catch (error) {
    console.error("Error getting custom claims:", error);
    throw error;
  }
};

/**
 * Find a user by email
 */
export const findUserByEmail = async (
  email: string
): Promise<FindUserResponse> => {
  try {
    const result = await findUserByEmailFunction({ email });
    return result.data as FindUserResponse;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

/**
 * Add a user to the current wedding by email
 * This function finds the user by email and adds them to the wedding
 */
export const addUserToWedding = async (
  email: string,
  weddingId: string,
  role?: "bride" | "groom" | "admin"
): Promise<FindUserResponse> => {
  try {
    const result = await findUserByEmailFunction({
      email,
      weddingId,
      role,
    });
    return result.data as FindUserResponse;
  } catch (error) {
    console.error("Error adding user to wedding:", error);
    throw error;
  }
};

/**
 * Check if current user has access to a specific wedding
 * This checks the custom claims in the user's token
 */
export const hasWeddingAccess = (
  userToken: any,
  weddingId: string
): boolean => {
  if (!userToken || !weddingId) return false;

  const weddings = userToken.weddings || [];
  return weddings.includes(weddingId);
};

/**
 * Get user's role in a specific wedding
 */
export const getUserWeddingRole = (
  userToken: any,
  weddingId: string
): string | null => {
  if (!userToken || !weddingId) return null;

  const weddingRoles = userToken.weddingRoles || {};
  return weddingRoles[weddingId] || null;
};

/**
 * Check if user is admin (global admin, not wedding-specific)
 */
export const isGlobalAdmin = (userToken: any): boolean => {
  return userToken?.admin === true;
};

/**
 * Get all weddings that a user has access to
 */
export const getUserWeddings = (userToken: any): string[] => {
  return userToken?.weddings || [];
};

/**
 * Get all wedding roles for a user
 */
export const getAllWeddingRoles = (userToken: any): Record<string, string> => {
  return userToken?.weddingRoles || {};
};

/**
 * Check if user has any role in a wedding (member, bride, groom, admin)
 */
export const hasAnyWeddingRole = (
  userToken: any,
  weddingId: string
): boolean => {
  return hasWeddingAccess(userToken, weddingId);
};

/**
 * Check if user has specific role in a wedding
 */
export const hasWeddingRole = (
  userToken: any,
  weddingId: string,
  role: string
): boolean => {
  const userRole = getUserWeddingRole(userToken, weddingId);
  return userRole === role;
};

/**
 * Check if user can manage wedding (is admin, owner, or has admin role in wedding)
 */
export const canManageWedding = (
  userToken: any,
  weddingId: string,
  weddingOwnerId?: string
): boolean => {
  // Global admin can manage any wedding
  if (isGlobalAdmin(userToken)) return true;

  // Wedding owner can manage their wedding
  if (weddingOwnerId && userToken?.uid === weddingOwnerId) return true;

  // User with admin role in this wedding can manage it
  return hasWeddingRole(userToken, weddingId, "admin");
};

/**
 * Remove a user from a wedding (convenience function)
 */
export const removeUserFromWedding = async (
  userId: string,
  weddingId: string
): Promise<CustomClaimsResponse> => {
  return removeUserCustomClaims({ userId, weddingId });
};

/**
 * Update user's role in a wedding
 */
export const updateUserWeddingRole = async (
  userId: string,
  weddingId: string,
  role: "bride" | "groom" | "admin"
): Promise<CustomClaimsResponse> => {
  // This reuses setUserCustomClaims which will update the role if user already has access
  return setUserCustomClaims({ userId, weddingId, role });
};

/**
 * Refresh user's custom claims by getting fresh token
 * This is useful after updating claims to ensure the frontend has the latest data
 */
export const refreshUserToken = async (): Promise<void> => {
  try {
    const { auth } = await import("../firebaseConfig");

    const currentUser = auth.currentUser;
    if (currentUser) {
      // Force refresh of the ID token to get updated custom claims
      await currentUser.getIdToken(true);
    }
  } catch (error) {
    console.error("Error refreshing user token:", error);
    throw error;
  }
};
