/**
 * Users Firebase Functions Types
 */

import { BaseResponse, ErrorResponse } from "./types";

// Delete User Auth
export interface DeleteUserAuthRequest {
  userId: string;
}

export interface DeleteUserAuthResponse extends BaseResponse {
  success: true;
  userId: string;
}

// Union types for all users functions
export type UsersFunctionRequest = DeleteUserAuthRequest;

export type UsersFunctionResponse = DeleteUserAuthResponse | ErrorResponse;
