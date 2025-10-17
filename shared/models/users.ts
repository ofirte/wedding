/**
 * User Model Types
 * User-related entity models shared between frontend and backend
 */

// Common User interface
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  disabled?: boolean;
  emailVerified?: boolean;
  customClaims?: Record<string, any>;
}

// Wedding User (extended User with wedding-specific data)
export interface WeddingUser {
  id?: string;
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: Date;
  photoURL?: string;
  weddingId?: string;
  weddingIds?: string[];
  role?: string;
  isAdmin?: boolean;
}

// Wedding Member interface
export interface WeddingMember {
  userId: string;
  role: string;
  addedAt: string;
  email: string;
  displayName?: string;
}
