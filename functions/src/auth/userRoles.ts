import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../shared/config";
import { WeddingRole, isValidWeddingRole } from "../shared/types";

interface SetUserRoleRequest {
  userId: string;
  role: WeddingRole;
}

interface SetGlobalAdminRequest {
  userId: string;
  isAdmin: boolean;
}

interface GetUserCustomClaimsRequest {
  userId?: string;
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
  if (!request.auth.token.admin) {
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
    const userRecord = await auth.getUser(userId);

    // Get current claims and update the role
    const currentClaims = userRecord.customClaims || {};
    const updatedClaims = {
      ...currentClaims,
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
 * Set or revoke global admin status for a user
 * Only existing global admins can call this function
 */
export const setGlobalAdmin = onCall(
  standardFunctionConfig,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Only existing global admins can manage admin status
    if (!request.auth.token.admin) {
      throw new HttpsError(
        "permission-denied",
        "Only global admins can manage admin status"
      );
    }

    const { userId, isAdmin } = request.data as SetGlobalAdminRequest;

    if (!userId || typeof isAdmin !== "boolean") {
      throw new HttpsError(
        "invalid-argument",
        "userId and isAdmin are required"
      );
    }

    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(userId);

      // Get current claims and update admin status
      const currentClaims = userRecord.customClaims || {};
      const updatedClaims: any = {
        ...currentClaims,
        admin: isAdmin,
      };

      // If removing admin, also ensure they have a role
      if (!isAdmin && !updatedClaims.role) {
        updatedClaims.role = "user"; // Default role
      }

      await auth.setCustomUserClaims(userId, updatedClaims);

      logger.info("User admin status updated successfully", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        isAdmin,
      });

      return {
        success: true,
        message: `User ${isAdmin ? "granted" : "revoked"} global admin status`,
        userId,
        isAdmin,
      };
    } catch (error) {
      logger.error("Failed to set global admin status", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        isAdmin,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to set global admin status");
    }
  }
);

/**
 * Get user's custom claims (for debugging/admin interface)
 */
export const getUserCustomClaims = onCall(
  standardFunctionConfig,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userId } = request.data as GetUserCustomClaimsRequest;
    const targetUserId = userId || request.auth.uid;

    // Users can view their own claims, or global admins can view any claims
    if (targetUserId !== request.auth.uid && !request.auth.token.admin) {
      throw new HttpsError(
        "permission-denied",
        "You can only view your own custom claims or you must be a global admin"
      );
    }

    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(targetUserId);

      return {
        success: true,
        userId: targetUserId,
        customClaims: userRecord.customClaims || {},
      };
    } catch (error) {
      logger.error("Failed to get custom claims", {
        requestingUser: request.auth.uid,
        targetUser: targetUserId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to get custom claims");
    }
  }
);

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
        role: "user" as WeddingRole,
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
