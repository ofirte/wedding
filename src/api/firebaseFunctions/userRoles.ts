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
  [UserRolesFunctions.LIST_USERS]: httpsCallable(
    functions,
    UserRolesFunctions.LIST_USERS
  ),
} as const;

// Export individual functions for convenience
export const initializeNewUser =
  userRolesFunctions[UserRolesFunctions.INITIALIZE_NEW_USER];

export const setUserRole = userRolesFunctions[UserRolesFunctions.SET_USER_ROLE];

export const listUsers = userRolesFunctions[UserRolesFunctions.LIST_USERS];

// Export the enum for external use
export { UserRolesFunctions };
