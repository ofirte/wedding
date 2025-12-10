import { LeadStatus, LeadPaymentStatus, LeadSource } from "@wedding-plan/types";

/**
 * Color coding for lead statuses (for UI badges)
 */
export const LeadStatusColors: Record<LeadStatus, string> = {
  new: "#9E9E9E", // Grey
  initial_contact: "#9E9E9E", // Grey
  contract_suggested: "#FF9800", // Orange
  contract_signed: "#4CAF50", // Green
  done: "#4CAF50", // Green
  lost: "#F44336", // Red
};

/**
 * Color coding for lead payment statuses
 */
export const LeadPaymentStatusColors: Record<LeadPaymentStatus, string> = {
  awaiting_payment: "#9E9E9E", // Grey
  advance_paid: "#FF9800", // Orange
  paid_in_full: "#4CAF50", // Green
};

/**
 * Color coding for lead sources
 */
export const LeadSourceColors: Record<LeadSource, string> = {
  website: "#2196F3",
  referral: "#4CAF50",
  instagram: "#E91E63",
  facebook: "#1976D2",
  google: "#FF9800",
  wedding_fair: "#9C27B0",
  direct: "#00BCD4",
  other: "#9E9E9E",
};
