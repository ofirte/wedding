/**
 * Wedding Model Types
 * Wedding-related entity models shared between frontend and backend
 */

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

export type WeddingPlan = (typeof WeddingPlans)[keyof typeof WeddingPlans];

// Check if a string is a valid wedding role
export const isValidWeddingRole = (role: string): role is WeddingRole => {
  return Object.values(WeddingRoles).includes(role as WeddingRole);
};

// Get all valid wedding role values as array
export const getValidWeddingRoles = (): WeddingRole[] => {
  return Object.values(WeddingRoles);
};

export interface WeddingMemberInput {
  plan: WeddingPlan;
  addedAt: string;
  addedBy: string;
}

export interface WeddingMembers {
  [userId: string]: WeddingMemberInput;
}

export interface Wedding {
  id: string;
  name: string;
  date: Date;
  createdAt: Date;
  userIds: string[]; // Legacy array of user IDs
  members?: WeddingMembers;
  brideName?: string;
  groomName?: string;
  venueName?: string;
  venueLink?: string;
  startTime?: string;
  invitationPhoto?: string;
  invitationCode?: string;
}