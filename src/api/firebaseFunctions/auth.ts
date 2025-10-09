import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { AuthFunctions } from "./types";

/**
 * Authentication-related Firebase Functions
 */
export const authFunctions = {
  [AuthFunctions.SET_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    AuthFunctions.SET_USER_CUSTOM_CLAIMS
  ),
  [AuthFunctions.REMOVE_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    AuthFunctions.REMOVE_USER_CUSTOM_CLAIMS
  ),
  [AuthFunctions.GET_USER_CUSTOM_CLAIMS]: httpsCallable(
    functions,
    AuthFunctions.GET_USER_CUSTOM_CLAIMS
  ),
  [AuthFunctions.FIND_USER_BY_EMAIL]: httpsCallable(
    functions,
    AuthFunctions.FIND_USER_BY_EMAIL
  ),
} as const;

// Export individual functions for convenience
export const setUserCustomClaims =
  authFunctions[AuthFunctions.SET_USER_CUSTOM_CLAIMS];
export const removeUserCustomClaims =
  authFunctions[AuthFunctions.REMOVE_USER_CUSTOM_CLAIMS];
export const getUserCustomClaims =
  authFunctions[AuthFunctions.GET_USER_CUSTOM_CLAIMS];
export const findUserByEmail = authFunctions[AuthFunctions.FIND_USER_BY_EMAIL];

// Export the enum for external use
export { AuthFunctions };
