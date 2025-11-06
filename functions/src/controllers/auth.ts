import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../common/config";
import {
  WeddingRoles,
  WeddingRole,
  isValidWeddingRole,
  InitializeNewUserRequest,
  InitializeNewUserResponse,
  SetUserRoleRequest,
  SetUserRoleResponse,
  ListUsersRequest,
  ListUsersResponse,
} from "@wedding-plan/types";
import {
  handleFunctionError,
  isAuthenticated,
  isSufficientWeddingRole,
} from "../common/utils";
import { InvitationService } from "../services/invitationService";

export const setUserRole = onCall<SetUserRoleRequest>(
  standardFunctionConfig,
  async (request): Promise<SetUserRoleResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });
    const { userId, role } = request.data;

    if (!isValidWeddingRole(role)) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid role. Must be one of: admin, producer, user`
      );
    }

    try {
      const auth = getAuth();
      const updatedClaims = {
        role,
      };

      await auth.setCustomUserClaims(userId, updatedClaims);

      logger.info("User role updated successfully", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        newRole: role,
      });

      return {
        success: true,
        message: `User role updated to ${role}`,
        userId,
        role,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { requestingUser: request.auth.uid, targetUser: userId, newRole: role },
        "Failed to set user role"
      );
    }
  }
);

/**
 * Initialize default role for a new user
 * Called automatically when a user signs up
 * If invitationToken is provided, validates and assigns producer role
 */
export const initializeNewUser = onCall<InitializeNewUserRequest>(
  standardFunctionConfig,
  async (request): Promise<InitializeNewUserResponse> => {
    isAuthenticated(request);
    const userId = request.auth.uid;
    const { invitationToken } = request.data || {};

    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(userId);

      // Check if user already has claims set
      if (
        userRecord.customClaims &&
        Object.keys(userRecord.customClaims).length > 0
      ) {
        return {
          success: true,
          message: "User already initialized",
          userId,
          role: userRecord.customClaims.role as WeddingRole,
        };
      }

      let assignedRole: WeddingRole = WeddingRoles.USER;

      // If invitation token is provided, validate and use it
      if (invitationToken) {
        const invitationService = new InvitationService();
        const { valid, role: updatedRole } =
          await invitationService.validateAndUseInvitation(
            invitationToken,
            userId,
            userRecord.email || ""
          );

        if (valid && updatedRole) {
          assignedRole = updatedRole;
        }
      }

      // Set claims for new user
      const claims = {
        role: assignedRole,
      };

      await auth.setCustomUserClaims(userId, claims);

      logger.info("New user initialized", {
        userId,
        role: assignedRole,
        usedInvitation: !!invitationToken && assignedRole !== WeddingRoles.USER,
      });

      return {
        success: true,
        message: `User initialized with ${assignedRole} role`,
        userId,
        role: assignedRole,
      };
    } catch (error) {
      handleFunctionError(error, { userId }, "Failed to initialize new user");
    }
  }
);

/**
 * List all users with their roles
 * Only global admins can call this function
 */
export const listUsers = onCall<ListUsersRequest>(
  standardFunctionConfig,
  async (request): Promise<ListUsersResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token?.role,
      neededRole: WeddingRoles.ADMIN,
    });

    try {
      const auth = getAuth();
      const listUsersResult = await auth.listUsers();
      const usersWithRoles = listUsersResult.users.map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime,
        lastSignInAt: userRecord.metadata.lastSignInTime,
        role: userRecord.customClaims?.role || WeddingRoles.USER,
      }));

      logger.info("Users list retrieved successfully", {
        requestingUser: request.auth.uid,
        totalUsers: usersWithRoles.length,
      });

      return {
        success: true,
        users: usersWithRoles,
        totalCount: usersWithRoles.length,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { requestingUser: request.auth.uid },
        "Failed to list users"
      );
    }
  }
);
