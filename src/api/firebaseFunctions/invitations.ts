import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { InvitationsFunctions } from "./types";
import {
  SendProducerInvitationRequest,
  SendProducerInvitationResponse,
  ValidateInvitationTokenRequest,
  ValidateInvitationTokenResponse,
  UseInvitationTokenRequest,
  UseInvitationTokenResponse,
  ListInvitationsRequest,
  ListInvitationsResponse,
  ResendInvitationRequest,
  ResendInvitationResponse,
  RevokeInvitationRequest,
  RevokeInvitationResponse,
} from "@wedding-plan/types";

/**
 * Invitation-related Firebase Functions
 */
export const invitationsFunctions = {
  [InvitationsFunctions.SEND_PRODUCER_INVITATION]: httpsCallable<
    SendProducerInvitationRequest,
    SendProducerInvitationResponse
  >(functions, InvitationsFunctions.SEND_PRODUCER_INVITATION),
  [InvitationsFunctions.VALIDATE_INVITATION_TOKEN]: httpsCallable<
    ValidateInvitationTokenRequest,
    ValidateInvitationTokenResponse
  >(functions, InvitationsFunctions.VALIDATE_INVITATION_TOKEN),
  [InvitationsFunctions.USE_INVITATION_TOKEN]: httpsCallable<
    UseInvitationTokenRequest,
    UseInvitationTokenResponse
  >(functions, InvitationsFunctions.USE_INVITATION_TOKEN),
  [InvitationsFunctions.LIST_INVITATIONS]: httpsCallable<
    ListInvitationsRequest,
    ListInvitationsResponse
  >(functions, InvitationsFunctions.LIST_INVITATIONS),
  [InvitationsFunctions.RESEND_INVITATION]: httpsCallable<
    ResendInvitationRequest,
    ResendInvitationResponse
  >(functions, InvitationsFunctions.RESEND_INVITATION),
  [InvitationsFunctions.REVOKE_INVITATION]: httpsCallable<
    RevokeInvitationRequest,
    RevokeInvitationResponse
  >(functions, InvitationsFunctions.REVOKE_INVITATION),
} as const;

// Export individual functions for convenience
export const sendProducerInvitation =
  invitationsFunctions[InvitationsFunctions.SEND_PRODUCER_INVITATION];
export const validateInvitationToken =
  invitationsFunctions[InvitationsFunctions.VALIDATE_INVITATION_TOKEN];
export const useInvitationToken =
  invitationsFunctions[InvitationsFunctions.USE_INVITATION_TOKEN];
export const listInvitations =
  invitationsFunctions[InvitationsFunctions.LIST_INVITATIONS];
export const resendInvitation =
  invitationsFunctions[InvitationsFunctions.RESEND_INVITATION];
export const revokeInvitation =
  invitationsFunctions[InvitationsFunctions.REVOKE_INVITATION];

// Export the enum for external use
export { InvitationsFunctions };
