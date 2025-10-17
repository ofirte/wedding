/**
 * Invitee Model Types
 * Invitee/Guest-related entity models shared between frontend and backend
 */

// RSVP Status types
export interface RSVPStatus {
  attendance?: boolean; // true = confirmed, false = declined, undefined = pending
  amount?: number; // Number of guests
  submittedAt?: string; // ISO string date
  note?: string; // Additional notes from the guest
}

// Main Invitee model
export interface Invitee {
  id: string;
  name: string;
  rsvp: string;
  percentage: number;
  side: string;
  relation: string;
  amount: number;
  amountConfirm: number;
  cellphone: string;
  rsvpStatus?: RSVPStatus;
}

// Message variable types for templates (subset of Invitee data)
export type MessageGuest = Pick<Invitee, "id" | "name"> & {
  cellphone?: string;
};
