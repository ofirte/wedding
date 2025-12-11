/**
 * Invitee Model Types
 * Invitee/Guest-related entity models shared between frontend and backend
 */

// RSVP Status types

export interface RSVPStatus {
  attendance?: boolean;
  amount?: string;
  isSubmitted?: boolean;
  submittedAt?: Date;
  [key: string]: any; // Allow any additional dynamic properties
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
  actualAttendance?: boolean;
  actualAmount?: number;
  checkedInAt?: Date;
  createdAt?: string; // ISO timestamp for ordering
}

