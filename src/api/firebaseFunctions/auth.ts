/**
 * Firebase Auth Functions API
 * Handles user role management and admin operations
 */

import { callFirebaseFunction } from "../../utils/firebaseFunctionsUtil";

/**
 * Initialize a new user with default role
 * Called automatically when user signs up or first signs in
 */
export const initializeNewUser = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFirebaseFunction("initializeNewUser", {});
    return result;
  } catch (error) {
    console.error("Error initializing new user:", error);
    throw error;
  }
};

/**
 * Set a user's default role (admin only)
 * @param uid - User ID to update
 * @param role - Role to assign (admin/producer/user)
 */
export const setUserRole = async (
  uid: string,
  role: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFirebaseFunction("setUserRole", {
      uid,
      role,
    });
    return result;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

/**
 * Set a user's global admin status (admin only)
 * @param uid - User ID to update
 * @param isAdmin - Whether to grant admin privileges
 */
export const setGlobalAdmin = async (
  uid: string,
  isAdmin: boolean
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await callFirebaseFunction("setGlobalAdmin", {
      uid,
      isAdmin,
    });
    return result;
  } catch (error) {
    console.error("Error setting global admin:", error);
    throw error;
  }
};

/**
 * Get a user's custom claims (admin only)
 * @param uid - User ID to check
 */
export const getUserCustomClaims = async (
  uid: string
): Promise<{
  customClaims: any;
  success: boolean;
}> => {
  try {
    const result = await callFirebaseFunction("getUserCustomClaims", {
      uid,
    });
    return result;
  } catch (error) {
    console.error("Error getting user custom claims:", error);
    throw error;
  }
};

// Export all auth functions for organized access
export const authFunctions = {
  initializeNewUser,
  setUserRole,
  setGlobalAdmin,
  getUserCustomClaims,
} as const;
