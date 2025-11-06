import { onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../common/config";
import {
  WeddingRoles,
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
import {
  handleFunctionError,
  isAuthenticated,
  isSufficientWeddingRole,
} from "../common/utils";
import {
  sendProducerInvitationEmail,
  sendInvitationReminderEmail,
  sendgridApiKey,
} from "../services/emailService";
import { InvitationService } from "../services/invitationService";

const APP_URL = process.env.APP_URL || "https://weddingplannerstudioapp.com";

/**
 * Send a producer invitation email
 * Only admins can call this function
 */
export const sendProducerInvitation = onCall<SendProducerInvitationRequest>(
  {
    ...standardFunctionConfig,
    secrets: [sendgridApiKey],
  },
  async (request): Promise<SendProducerInvitationResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });

    const { email, language = "he" } = request.data;

    try {
      const auth = getAuth();
      const invitationService = new InvitationService();

      // Get inviter info
      const inviterUser = await auth.getUser(request.auth.uid);
      const inviterName = inviterUser.displayName || inviterUser.email || "Admin";

      // Create invitation using service
      const { invitation, token } = await invitationService.createInvitation(
        email,
        request.auth.uid,
        inviterName
      );

      // Send invitation email
      await sendProducerInvitationEmail(email, token, inviterName, APP_URL, language);

      logger.info("Producer invitation sent successfully", {
        invitationId: invitation.id,
        email,
        invitedBy: request.auth.uid,
        language,
      });

      return {
        success: true,
        message: "Invitation sent successfully",
        invitationId: invitation.id,
        email,
        expiresAt: invitation.expiresAt instanceof Date
          ? invitation.expiresAt.toISOString()
          : new Date(invitation.expiresAt as any).toISOString(),
      };
    } catch (error) {
      handleFunctionError(
        error,
        { email, requestingUser: request.auth.uid },
        "Failed to send producer invitation"
      );
    }
  }
);

/**
 * Validate an invitation token
 * Can be called by anyone (unauthenticated)
 */
export const validateInvitationToken = onCall<ValidateInvitationTokenRequest>(
  standardFunctionConfig,
  async (request): Promise<ValidateInvitationTokenResponse> => {
    const { token } = request.data;

    try {
      const invitationService = new InvitationService();
      const result = await invitationService.validateToken(token);

      logger.info("Invitation token validation", {
        token: token.substring(0, 8) + "...",
        valid: result.valid,
      });

      return {
        success: result.valid,
        valid: result.valid,
        email: result.invitation?.email,
        role: result.invitation?.role,
        expired: result.expired,
        message: result.message,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { token: token.substring(0, 8) + "..." },
        "Failed to validate invitation token"
      );
    }
  }
);

/**
 * Use an invitation token after user signs up
 * Called automatically after user creates account
 */
export const useInvitationToken = onCall<UseInvitationTokenRequest>(
  standardFunctionConfig,
  async (request): Promise<UseInvitationTokenResponse> => {
    isAuthenticated(request);

    const { token } = request.data;

    try {
      const auth = getAuth();
      const invitationService = new InvitationService();

      // Get user info
      const user = await auth.getUser(request.auth.uid);
      const userEmail = user.email;

      if (!userEmail) {
        throw new Error("User email is required");
      }

      // Use invitation via service
      const result = await invitationService.useInvitation(
        token,
        request.auth.uid,
        userEmail
      );

      return {
        success: true,
        message: result.message,
        roleAssigned: result.roleAssigned,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId: request.auth.uid, token: token.substring(0, 8) + "..." },
        "Failed to use invitation token"
      );
    }
  }
);

/**
 * List all invitations
 * Only admins can call this function
 */
export const listInvitations = onCall<ListInvitationsRequest>(
  standardFunctionConfig,
  async (request): Promise<ListInvitationsResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });

    const { status } = request.data || {};

    try {
      const invitationService = new InvitationService();
      const invitations = await invitationService.listInvitations(status);

      // Convert dates to ISO strings
      const invitationsData = invitations.map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        token: invitation.token,
        createdAt:
          invitation.createdAt instanceof Date
            ? invitation.createdAt.toISOString()
            : new Date(invitation.createdAt as any).toISOString(),
        expiresAt:
          invitation.expiresAt instanceof Date
            ? invitation.expiresAt.toISOString()
            : new Date(invitation.expiresAt as any).toISOString(),
        usedAt: invitation.usedAt
          ? invitation.usedAt instanceof Date
            ? invitation.usedAt.toISOString()
            : new Date(invitation.usedAt as any).toISOString()
          : undefined,
        invitedBy: invitation.invitedBy,
        inviterName: invitation.inviterName,
      }));

      logger.info("Invitations list retrieved successfully", {
        requestingUser: request.auth.uid,
        totalCount: invitationsData.length,
        status: status || "all",
      });

      return {
        success: true,
        invitations: invitationsData,
        totalCount: invitationsData.length,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { requestingUser: request.auth.uid },
        "Failed to list invitations"
      );
    }
  }
);

/**
 * Resend an invitation email
 * Only admins can call this function
 */
export const resendInvitation = onCall<ResendInvitationRequest>(
  {
    ...standardFunctionConfig,
    secrets: [sendgridApiKey],
  },
  async (request): Promise<ResendInvitationResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });

    const { invitationId } = request.data;

    try {
      const invitationService = new InvitationService();

      // Validate invitation can be resent
      const invitation = await invitationService.validateResend(invitationId);

      const expiresAt = invitation.expiresAt instanceof Date
        ? invitation.expiresAt
        : new Date(invitation.expiresAt as any);

      // Send reminder email
      await sendInvitationReminderEmail(
        invitation.email,
        invitation.token,
        invitation.inviterName || "Admin",
        APP_URL,
        expiresAt
      );

      logger.info("Invitation resent successfully", {
        invitationId,
        email: invitation.email,
        resentBy: request.auth.uid,
      });

      return {
        success: true,
        message: "Invitation resent successfully",
        invitationId,
        email: invitation.email,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { invitationId, requestingUser: request.auth.uid },
        "Failed to resend invitation"
      );
    }
  }
);

/**
 * Revoke an invitation
 * Only admins can call this function
 */
export const revokeInvitation = onCall<RevokeInvitationRequest>(
  standardFunctionConfig,
  async (request): Promise<RevokeInvitationResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });

    const { invitationId } = request.data;

    try {
      const invitationService = new InvitationService();
      await invitationService.revokeInvitation(invitationId);

      logger.info("Invitation revoked successfully", {
        invitationId,
        revokedBy: request.auth.uid,
      });

      return {
        success: true,
        message: "Invitation revoked successfully",
        invitationId,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { invitationId, requestingUser: request.auth.uid },
        "Failed to revoke invitation"
      );
    }
  }
);
