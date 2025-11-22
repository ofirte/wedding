/**
 * Lead Model Types
 * Lead management and CRM-related entity models shared between frontend and backend
 */

/**
 * Lead status representing the stage in the sales pipeline
 */
export type LeadStatus =
  | "new"
  | "initial_contact"
  | "qualified"
  | "proposal_sent"
  | "contract_offered"
  | "signed"
  | "deposit_paid"
  | "active_client"
  | "done"
  | "lost";

/**
 * Source of the lead (how they found you)
 */
export type LeadSource =
  | "website"
  | "referral"
  | "instagram"
  | "facebook"
  | "google"
  | "wedding_fair"
  | "direct"
  | "other";

/**
 * Type of event/activity logged for a lead
 */
export type LeadEventType =
  | "created"
  | "status_changed"
  | "field_updated"
  | "note_added"
  | "follow_up_set"
  | "follow_up_completed";

/**
 * Main Lead entity
 */
export interface Lead {
  id: string;
  producerId: string; // User ID of the producer who owns this lead
  name: string;
  email: string;
  phone?: string;
  weddingDate?: string; // ISO date string
  budget?: number;
  estimatedGuests?: number;
  status: LeadStatus;
  source?: LeadSource;
  service?: string; // Type of service/package (e.g., "Full Wedding Production", "Day of Event Management")
  notes?: string;
  followUpDate?: string; // ISO date string
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  convertedToWeddingId?: string; // If lead becomes a client, link to wedding
}

/**
 * Event/Activity log entry for a lead
 */
export interface LeadEvent {
  id: string;
  leadId: string;
  type: LeadEventType;
  userId: string; // Who performed the action
  userName?: string; // Display name of who performed the action
  timestamp: string; // ISO timestamp
  description: string; // Human-readable description of what happened
  metadata?: {
    // Additional context for the event
    oldValue?: string;
    newValue?: string;
    field?: string;
    [key: string]: any;
  };
}

/**
 * Color coding for lead statuses (for UI badges)
 * Note: Labels are handled by i18n translations (leads.statuses.* and leads.sources.*)
 */
export const LeadStatusColors: Record<LeadStatus, string> = {
  new: "#9E9E9E", // Grey
  initial_contact: "#2196F3", // Blue
  qualified: "#4CAF50", // Green
  proposal_sent: "#FF9800", // Orange
  contract_offered: "#FF9800", // Orange
  signed: "#8BC34A", // Light Green
  deposit_paid: "#4CAF50", // Green
  active_client: "#4CAF50", // Green
  done: "#8BC34A", // Light Green
  lost: "#F44336", // Red
};
