import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { UserRolesFunctions } from "./types";
import {
  InitializeNewUserRequest,
  InitializeNewUserResponse,
  SetUserRoleRequest,
  SetUserRoleResponse,
  ListUsersRequest,
  ListUsersResponse,
} from "../../../shared";

/**
 * User Roles-related Firebase Functions
 */
export const userRolesFunctions = {
  [UserRolesFunctions.INITIALIZE_NEW_USER]: httpsCallable<
    InitializeNewUserRequest,
    InitializeNewUserResponse
  >(functions, UserRolesFunctions.INITIALIZE_NEW_USER),
  [UserRolesFunctions.SET_USER_ROLE]: httpsCallable<
    SetUserRoleRequest,
    SetUserRoleResponse
  >(functions, UserRolesFunctions.SET_USER_ROLE),
  [UserRolesFunctions.LIST_USERS]: httpsCallable<
    ListUsersRequest,
    ListUsersResponse
  >(functions, UserRolesFunctions.LIST_USERS),
} as const;

// Export individual functions for convenience
export const initializeNewUser =
  userRolesFunctions[UserRolesFunctions.INITIALIZE_NEW_USER];

export const setUserRole = userRolesFunctions[UserRolesFunctions.SET_USER_ROLE];

export const listUsers = userRolesFunctions[UserRolesFunctions.LIST_USERS];

// Export the enum for external use
export { UserRolesFunctions };
