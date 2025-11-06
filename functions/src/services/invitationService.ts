/**
 * Invitation Service
 * Business logic layer for invitation operations
 */

import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { ProducerInvitationModel } from "../models";
import { ProducerInvitation, InvitationStatus, WeddingRole } from "@wedding-plan/types";
import { randomBytes } from "crypto";

const INVITATION_EXPIRY_DAYS = 7;

export class InvitationService {
  private invitationModel: ProducerInvitationModel;

  constructor() {
    this.invitationModel = new ProducerInvitationModel();
  }

  /**
   * Generate a secure random token for invitation
   */
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Validate if a user with the email already exists
   */
  private async validateEmailNotExists(email: string): Promise<void> {
    const auth = getAuth();
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        throw new HttpsError(
          "already-exists",
          "A user with this email already exists"
        );
      }
    } catch (error: any) {
      // If error is not "user not found", rethrow it
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
      // User not found is good - we can proceed
    }
  }

  /**
   * Check if there's already a pending invitation for this email
   */
  private async validateNoPendingInvitation(email: string): Promise<void> {
    const pendingInvitations = await this.invitationModel.getPendingByEmail(email);
    if (pendingInvitations.length > 0) {
      throw new HttpsError(
        "already-exists",
        "A pending invitation already exists for this email"
      );
    }
  }

  /**
   * Create a new producer invitation
   */
  async createInvitation(
    email: string,
    invitedBy: string,
    inviterName: string
  ): Promise<{ invitation: ProducerInvitation; token: string }> {
    // Validate email format
    if (!email || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "Valid email is required");
    }

    // Check if user exists
    await this.validateEmailNotExists(email);

    // Check for pending invitations
    await this.validateNoPendingInvitation(email);

    // Create invitation record
    const token = this.generateToken();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    const invitationData: Omit<ProducerInvitation, "id"> = {
      email,
      role: "producer",
      token,
      status: "pending",
      createdAt: now,
      expiresAt,
      invitedBy,
      inviterName,
    };

    const invitation = await this.invitationModel.create(invitationData);

    logger.info("Producer invitation created", {
      invitationId: invitation.id,
      email,
      invitedBy,
    });

    return { invitation, token };
  }

  /**
   * Validate an invitation token
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    invitation?: ProducerInvitation;
    message: string;
    expired?: boolean;
  }> {
    if (!token) {
      throw new HttpsError("invalid-argument", "Token is required");
    }

    const invitation = await this.invitationModel.getByToken(token);

    if (!invitation) {
      return {
        valid: false,
        message: "Invalid invitation token",
      };
    }

    // Check if already used
    if (invitation.status === "used") {
      return {
        valid: false,
        message: "This invitation has already been used",
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = invitation.expiresAt instanceof Date
      ? invitation.expiresAt
      : new Date(invitation.expiresAt as any);
    const expired = now > expiresAt;

    if (expired) {
      // Update status to expired
      await this.invitationModel.update(invitation.id, { status: "expired" });

      return {
        valid: false,
        expired: true,
        message: "This invitation has expired",
      };
    }

    logger.info("Invitation token validated", {
      invitationId: invitation.id,
      email: invitation.email,
    });

    return {
      valid: true,
      invitation,
      message: "Valid invitation token",
    };
  }

  /**
   * Validate and use an invitation token for a user
   */
  async validateAndUseInvitation(
    token: string,
    userId: string,
    userEmail: string
  ): Promise<{ valid: boolean; role?: WeddingRole; message: string }> {
    if (!token) {
      return {
        valid: false,
        message: "No invitation token provided",
      };
    }

    const invitation = await this.invitationModel.getByToken(token);

    if (!invitation) {
      logger.warn("Invitation token not found during user initialization", {
        userId,
        token: token.substring(0, 8) + "...",
      });
      return {
        valid: false,
        message: "Invalid invitation token",
      };
    }

    // Validate invitation status
    if (invitation.status !== "pending") {
      logger.warn("Invitation not in pending status", {
        userId,
        email: userEmail,
        status: invitation.status,
      });
      return {
        valid: false,
        message: "Invitation is not valid",
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = invitation.expiresAt instanceof Date
      ? invitation.expiresAt
      : new Date(invitation.expiresAt as any);

    if (now > expiresAt) {
      await this.invitationModel.update(invitation.id, { status: "expired" });
      logger.warn("Invitation expired during user initialization", {
        userId,
        email: userEmail,
        expired: true,
      });
      return {
        valid: false,
        message: "Invitation has expired",
      };
    }

    // Validate email matches
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      logger.warn("Email mismatch for invitation", {
        userId,
        invitationEmail: invitation.email,
        userEmail,
      });
      return {
        valid: false,
        message: `This invitation is for ${invitation.email}`,
      };
    }

    // Mark invitation as used
    await this.invitationModel.update(invitation.id, {
      status: "used",
      usedAt: FieldValue.serverTimestamp() as any,
    });

    logger.info("Invitation used successfully", {
      invitationId: invitation.id,
      userId,
      email: userEmail,
      role: invitation.role,
    });

    return {
      valid: true,
      role: invitation.role as WeddingRole,
      message: `Invitation accepted. Role assigned: ${invitation.role}`,
    };
  }

  /**
   * Use an invitation token (requires email validation)
   */
  async useInvitation(
    token: string,
    userId: string,
    userEmail: string
  ): Promise<{ roleAssigned: string; message: string }> {
    if (!token) {
      throw new HttpsError("invalid-argument", "Token is required");
    }

    if (!userEmail) {
      throw new HttpsError("failed-precondition", "User email is required");
    }

    const invitation = await this.invitationModel.getByToken(token);

    if (!invitation) {
      throw new HttpsError("not-found", "Invalid invitation token");
    }

    // Validate invitation
    if (invitation.status !== "pending") {
      throw new HttpsError("failed-precondition", "Invitation is not valid");
    }

    const now = new Date();
    const expiresAt = invitation.expiresAt instanceof Date
      ? invitation.expiresAt
      : new Date(invitation.expiresAt as any);

    if (now > expiresAt) {
      await this.invitationModel.update(invitation.id, { status: "expired" });
      throw new HttpsError("failed-precondition", "Invitation has expired");
    }

    // Validate email matches
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new HttpsError(
        "permission-denied",
        `This invitation is for ${invitation.email}. Please sign in with that email address.`
      );
    }

    // Assign producer role
    const auth = getAuth();
    await auth.setCustomUserClaims(userId, {
      role: invitation.role,
    });

    // Mark invitation as used
    await this.invitationModel.update(invitation.id, {
      status: "used",
      usedAt: FieldValue.serverTimestamp() as any,
    });

    logger.info("Invitation token used successfully", {
      invitationId: invitation.id,
      userId,
      email: userEmail,
      role: invitation.role,
    });

    return {
      roleAssigned: invitation.role,
      message: `You now have ${invitation.role} access`,
    };
  }

  /**
   * Get all invitations with optional status filter
   */
  async listInvitations(status?: string): Promise<ProducerInvitation[]> {
    const invitations = await this.invitationModel.getAllOrdered(status);

    // Check for expired invitations and update them
    const now = new Date();
    const updatedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const expiresAt = invitation.expiresAt instanceof Date
          ? invitation.expiresAt
          : new Date(invitation.expiresAt as any);

        // If pending but expired, update status
        if (invitation.status === "pending" && now > expiresAt) {
          await this.invitationModel.update(invitation.id, { status: "expired" });
          return { ...invitation, status: "expired" as InvitationStatus };
        }

        return invitation;
      })
    );

    return updatedInvitations;
  }

  /**
   * Resend an invitation (validation that it can be resent)
   */
  async validateResend(invitationId: string): Promise<ProducerInvitation> {
    if (!invitationId) {
      throw new HttpsError("invalid-argument", "Invitation ID is required");
    }

    const invitation = await this.invitationModel.getById(invitationId);

    if (!invitation) {
      throw new HttpsError("not-found", "Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new HttpsError(
        "failed-precondition",
        "Can only resend pending invitations"
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = invitation.expiresAt instanceof Date
      ? invitation.expiresAt
      : new Date(invitation.expiresAt as any);

    if (now > expiresAt) {
      throw new HttpsError(
        "failed-precondition",
        "Cannot resend expired invitation. Please create a new one."
      );
    }

    return invitation;
  }

  /**
   * Revoke an invitation
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    if (!invitationId) {
      throw new HttpsError("invalid-argument", "Invitation ID is required");
    }

    const invitation = await this.invitationModel.getById(invitationId);

    if (!invitation) {
      throw new HttpsError("not-found", "Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new HttpsError(
        "failed-precondition",
        "Can only revoke pending invitations"
      );
    }

    // Update invitation status to expired (effectively revoking it)
    await this.invitationModel.update(invitationId, { status: "expired" });

    logger.info("Invitation revoked successfully", {
      invitationId,
      email: invitation.email,
    });
  }
}
