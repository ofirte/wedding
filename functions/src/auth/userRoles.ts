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
} from "../shared";

export const setUserRole = onCall<SetUserRoleRequest>(
  standardFunctionConfig,
  async (request): Promise<SetUserRoleResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Only global admins can set user roles
    // const isAdmin = request.auth.token?.role === WeddingRoles.ADMIN;
    // if (!isAdmin) {
    //   throw new HttpsError(
    //     "permission-denied",
    //     "Only global admins can manage user roles"
    //   );
    // }

    const { userId, role } = request.data;

    if (!userId || !role) {
      throw new HttpsError("invalid-argument", "userId and role are required");
    }

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
      logger.error("Failed to set user role", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        role,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to set user role");
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
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

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
      logger.error("Failed to initialize new user", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to initialize user");
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
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Only global admins can list all users
    // const isAdmin = request.auth.token?.role === WeddingRoles.ADMIN;
    // if (!isAdmin) {
    //   throw new HttpsError(
    //     "permission-denied",
    //     "Only global admins can list users"
    //   );
    // }

    try {
      const auth = getAuth();

      // Get all users (Firebase Admin SDK allows listing users)
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
      logger.error("Failed to list users", {
        requestingUser: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to list users");
    }
  }
);
