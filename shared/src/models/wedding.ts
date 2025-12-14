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
  /** @deprecated Plan is now stored at wedding level, not per member */
  plan?: WeddingPlan;
  addedAt: string;
  addedBy: string;
}

export interface WeddingMembers {
  [userId: string]: WeddingMemberInput;
}

/**
 * Tracks when a task template was applied to a wedding
 * Used for audit trail and potential future features (bulk updates, etc.)
 */
export interface AppliedTaskTemplate {
  templateId: string;
  templateName: string;
  appliedAt: string; // ISO timestamp
  appliedBy: string; // User ID who applied the template
}

export interface Wedding {
  id: string;
  name: string;
  date: Date;
  createdAt: Date;
  userIds?: string[]; // Legacy array of user IDs
  members?: WeddingMembers;
  brideName?: string;
  groomName?: string;
  venueName?: string;
  venueLink?: string;
  navigationLink?: string; // Google Maps/Waze link for navigation
  startTime?: string;
  invitationPhoto?: string;
  invitationCode?: string;
  // Payment/Plan related fields
  plan?: WeddingPlan;
  planActivatedAt?: string;
  paidGuestCount?: number;
  // Task template tracking
  appliedTaskTemplates?: AppliedTaskTemplate[];
}