/**
 * User Roles Firebase Functions API Types
 */

import { BaseResponse, ErrorResponse } from "./base";

// Initialize New User - No request body needed (uses auth.uid)
export interface InitializeNewUserRequest {}

export interface InitializeNewUserResponse extends BaseResponse {
  success: true;
  message: string;
  userId: string;
  role?: string;
}

// Set User Role
export interface SetUserRoleRequest {
  userId: string;
  role: string;
}

export interface SetUserRoleResponse extends BaseResponse {
  success: true;
  message: string;
  userId: string;
  role: string;
}

// List Users - No request body needed
export interface ListUsersRequest {}

export interface ListUsersResponse extends BaseResponse {
  success: true;
  users: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
    disabled?: boolean;
    createdAt?: string;
    lastSignInAt?: string | null;
    role: string;
  }[];
  totalCount: number;
}

// Union types for all user roles functions
export type UserRolesFunctionRequest =
  | InitializeNewUserRequest
  | SetUserRoleRequest
  | ListUsersRequest;

export type UserRolesFunctionResponse =
  | InitializeNewUserResponse
  | SetUserRoleResponse
  | ListUsersResponse
  | ErrorResponse;
