/**
 * Shared types for Firebase Functions
 * This file contains all request and response types for Firebase Functions
 * and can be imported by both frontend and backend
 */

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

// Wedding role types - defines the hierarchy of permissions within a wedding
export const WeddingRoles = {
  ADMIN: "admin",
  PRODUCER: "producer",
  USER: "user",
} as const;

export type WeddingRole = (typeof WeddingRoles)[keyof typeof WeddingRoles];

// Wedding plan types
export const WeddingPlans = {
  PAID: "paid",
  FREE: "free",
} as const;

// Check if a string is a valid wedding role
export const isValidWeddingRole = (role: string): role is WeddingRole => {
  return Object.values(WeddingRoles).includes(role as WeddingRole);
};

// Get all valid wedding role values as array
export const getValidWeddingRoles = (): WeddingRole[] => {
  return Object.values(WeddingRoles);
};

// Simplified custom claims structure - no longer stores wedding lists
export interface UserCustomClaims {
  admin?: boolean; // Global admin flag
  role?: WeddingRole; // Default role for new weddings
}

// Common types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  disabled?: boolean;
  emailVerified?: boolean;
  customClaims?: Record<string, any>;
}

export interface WeddingMember {
  userId: string;
  role: string;
  addedAt: string;
  email: string;
  displayName?: string;
}
