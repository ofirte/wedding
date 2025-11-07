/**
 * Producer Invitation Model
 * Represents an invitation for a new user to join with producer role
 */

export type InvitationStatus = "pending" | "used" | "expired";

export interface ProducerInvitation {
  id: string;
  email: string;
  role: "producer"; // For future extensibility, could support other roles
  token: string; // Secure random token
  status: InvitationStatus;
  createdAt: Date | string;
  expiresAt: Date | string;
  usedAt?: Date | string;
  invitedBy: string; // Admin user ID
  inviterName?: string; // Admin display name
}

/**
 * Invitation data for API responses (with serialized dates)
 */
export interface InvitationData {
  id: string;
  email: string;
  role: "producer";
  token: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  invitedBy: string;
  inviterName?: string;
}
