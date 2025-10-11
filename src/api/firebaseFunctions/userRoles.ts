import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { UserRolesFunctions } from "./types";

/**
 * User Roles-related Firebase Functions
 */
export const userRolesFunctions = {
  [UserRolesFunctions.INITIALIZE_NEW_USER]: httpsCallable(
    functions,
    UserRolesFunctions.INITIALIZE_NEW_USER
  ),
  [UserRolesFunctions.SET_USER_ROLE]: httpsCallable(
    functions,
    UserRolesFunctions.SET_USER_ROLE
  ),
  [UserRolesFunctions.SET_GLOBAL_ADMIN]: httpsCallable(
    functions,
    UserRolesFunctions.SET_GLOBAL_ADMIN
  ),
  [UserRolesFunctions.GET_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    UserRolesFunctions.GET_USER_CUSTOM_CLAIMS
  ),
  [UserRolesFunctions.SET_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    UserRolesFunctions.SET_USER_CUSTOM_CLAIMS
  ),
  [UserRolesFunctions.REMOVE_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    UserRolesFunctions.REMOVE_USER_CUSTOM_CLAIMS
  ),
  [UserRolesFunctions.FIND_USER_BY_EMAIL]: httpsCallable(
    functions,
    UserRolesFunctions.FIND_USER_BY_EMAIL
  ),
} as const;

// Export individual functions for convenience
export const initializeNewUser =
  userRolesFunctions[UserRolesFunctions.INITIALIZE_NEW_USER];
export const setUserRole = userRolesFunctions[UserRolesFunctions.SET_USER_ROLE];
export const setGlobalAdmin =
  userRolesFunctions[UserRolesFunctions.SET_GLOBAL_ADMIN];
export const getUserCustomClaims =
  userRolesFunctions[UserRolesFunctions.GET_USER_CUSTOM_CLAIMS];
export const setUserCustomClaims =
  userRolesFunctions[UserRolesFunctions.SET_USER_CUSTOM_CLAIMS];
export const removeUserCustomClaims =
  userRolesFunctions[UserRolesFunctions.REMOVE_USER_CUSTOM_CLAIMS];
export const findUserByEmail =
  userRolesFunctions[UserRolesFunctions.FIND_USER_BY_EMAIL];

// Export the enum for external use
export { UserRolesFunctions };
