/**
 * Base API Types for Firebase Functions
 * Common request and response interfaces used across all functions
 */

import { WeddingRole } from "../models";

// Base response type for all functions
export interface BaseResponse {
  success: boolean;
  message?: string;
}

// Error response type
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
  code?: string;
}


// Simplified custom claims structure - no longer stores wedding lists
export interface UserCustomClaims {
  admin?: boolean; // Global admin flag
  role?: WeddingRole; // Default role for new weddings
}
