import { InvitationData } from "../models";
import { BaseResponse } from "./base";

/**
 * Send Producer Invitation Request
 */
export interface SendProducerInvitationRequest {
  email: string;
  language?: "en" | "he";
}

export interface SendProducerInvitationResponse extends BaseResponse {
  invitationId: string;
  email: string;
  expiresAt: string;
}

/**
 * Validate Invitation Token Request
 */
export interface ValidateInvitationTokenRequest {
  token: string;
}

export interface ValidateInvitationTokenResponse extends BaseResponse {
  valid: boolean;
  email?: string;
  role?: string;
  expired?: boolean;
}

/**
 * Use Invitation Token Request (called after user signs up)
 */
export interface UseInvitationTokenRequest {
  token: string;
}

export interface UseInvitationTokenResponse extends BaseResponse {
  roleAssigned: string;
}

/**
 * List Invitations Request (admin only)
 */
export interface ListInvitationsRequest {
  status?: "pending" | "used" | "expired" | "all";
}

export interface ListInvitationsResponse extends BaseResponse {
  invitations: InvitationData[];
  totalCount: number;
}

/**
 * Resend Invitation Request
 */
export interface ResendInvitationRequest {
  invitationId: string;
}

export interface ResendInvitationResponse extends BaseResponse {
  invitationId: string;
  email: string;
}

/**
 * Revoke Invitation Request
 */
export interface RevokeInvitationRequest {
  invitationId: string;
}

export interface RevokeInvitationResponse extends BaseResponse {
  invitationId: string;
}
