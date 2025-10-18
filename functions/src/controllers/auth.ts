import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../common/config";
import {
  WeddingRoles,
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
 */
export const initializeNewUser = onCall<InitializeNewUserRequest>(
  standardFunctionConfig,
  async (request): Promise<InitializeNewUserResponse> => {
    isAuthenticated(request);
    const userId = request.auth.uid;

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
        };
      }

      // Set default claims for new user
      const defaultClaims = {
        role: WeddingRoles.USER,
      };

      await auth.setCustomUserClaims(userId, defaultClaims);

      logger.info("New user initialized with default role", {
        userId,
        defaultRole: "user",
      });

      return {
        success: true,
        message: "User initialized with default role",
        userId,
        role: "user",
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
