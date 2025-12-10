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
  | "contract_suggested"
  | "contract_signed"
  | "done"
  | "lost";

/**
 * Payment status for leads with signed contracts
 */
export type LeadPaymentStatus =
  | "awaiting_payment"
  | "advance_paid"
  | "paid_in_full";

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
  quotation?: number; // Quoted price for the service
  advanceAmount?: number; // Amount paid as advance payment
  estimatedGuests?: number;
  status: LeadStatus;
  paymentStatus?: LeadPaymentStatus;
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

