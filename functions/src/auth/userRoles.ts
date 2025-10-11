import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../shared/config";
import { WeddingRole, WeddingRoles, isValidWeddingRole } from "../shared/types";

interface SetUserRoleRequest {
  userId: string;
  role: WeddingRole;
}

/**
 * Set user's default role (affects all their wedding memberships)
 * Only global admins can call this function
 */
export const setUserRole = onCall(standardFunctionConfig, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Only global admins can set user roles
  const isAdmin = request.auth.token?.role === WeddingRoles.ADMIN;
  if (!isAdmin) {
    throw new HttpsError(
      "permission-denied",
      "Only global admins can manage user roles"
    );
  }

  const { userId, role } = request.data as SetUserRoleRequest;

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
});

/**
 * Initialize default role for a new user
 * Called automatically when a user signs up
 */
export const initializeNewUser = onCall(
  standardFunctionConfig,
  async (request) => {
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
