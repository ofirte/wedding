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
} as const;

// Export individual functions for convenience
export const initializeNewUser =
  userRolesFunctions[UserRolesFunctions.INITIALIZE_NEW_USER];

export const setUserRole =
  userRolesFunctions[UserRolesFunctions.SET_USER_ROLE];

// Export the enum for external use
export { UserRolesFunctions };
