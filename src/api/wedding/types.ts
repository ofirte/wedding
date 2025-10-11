export const WeddingPlans = {
  PAID: "paid",
  FREE: "free",
} as const;

export type WeddingPlan = (typeof WeddingPlans)[keyof typeof WeddingPlans];

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
