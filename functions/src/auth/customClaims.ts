import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../shared/config";

interface SetCustomClaimsRequest {
  userId: string;
  weddingId: string;
  role?: "bride" | "groom" | "admin";
}

interface RemoveCustomClaimsRequest {
  userId: string;
}

/**
 * Set custom claims for a user (wedding access)
 * This function allows adding a user to a wedding with specific role
 */
export const setUserCustomClaims = onCall(
  standardFunctionConfig,
  async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userId, weddingId, role } = request.data as SetCustomClaimsRequest;

    // Validate input
    if (!userId || !weddingId) {
      throw new HttpsError(
        "invalid-argument",
        "userId and weddingId are required"
      );
    }

    if (role && !["bride", "groom", "admin"].includes(role)) {
      throw new HttpsError(
        "invalid-argument",
        "role must be one of: bride, groom, admin"
      );
    }

    try {
      const auth = getAuth();
      const db = getFirestore();

      // Check if the requesting user has permission to modify this wedding
      const weddingRef = db.collection("weddings").doc(weddingId);
      const weddingDoc = await weddingRef.get();

      if (!weddingDoc.exists) {
        throw new HttpsError("not-found", "Wedding not found");
      }

      const weddingData = weddingDoc.data();
      const requestingUserClaims = request.auth.token;

      // Check if requesting user is admin or already a member of this wedding
      const isAdmin = requestingUserClaims.admin === true;
      const hasWeddingAccess =
        requestingUserClaims.weddings?.includes(weddingId);
      const isWeddingOwner = weddingData?.createdBy === request.auth.uid;

      if (!isAdmin && !hasWeddingAccess && !isWeddingOwner) {
        throw new HttpsError(
          "permission-denied",
          "You don't have permission to manage this wedding"
        );
      }

      // Get current user claims
      const userRecord = await auth.getUser(userId);
      const currentClaims = userRecord.customClaims || {};

      // Update wedding access in custom claims
      const currentWeddings = currentClaims.weddings || [];
      const weddingRoles = currentClaims.weddingRoles || {};

      // Add wedding to user's accessible weddings if not already present
      if (!currentWeddings.includes(weddingId)) {
        currentWeddings.push(weddingId);
      }

      // Set role for this specific wedding
      if (role) {
        weddingRoles[weddingId] = role;
      }

      // Update custom claims
      const updatedClaims = {
        ...currentClaims,
        weddings: currentWeddings,
        weddingRoles: weddingRoles,
      };

      await auth.setCustomUserClaims(userId, updatedClaims);

      // Also update the wedding document to include this user
      const weddingMembers = weddingData?.members || [];
      if (!weddingMembers.some((member: any) => member.uid === userId)) {
        weddingMembers.push({
          uid: userId,
          email: userRecord.email,
          role: role || "member",
          addedAt: new Date().toISOString(),
          addedBy: request.auth.uid,
        });

        await weddingRef.update({
          members: weddingMembers,
          updatedAt: new Date().toISOString(),
        });
      }

      logger.info("Custom claims updated successfully", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        weddingId,
        role,
      });

      return {
        success: true,
        message: "Custom claims updated successfully",
        userId,
        weddingId,
        role,
      };
    } catch (error) {
      logger.error("Failed to set custom claims", {
        requestingUser: request.auth?.uid,
        targetUser: userId,
        weddingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to set custom claims");
    }
  }
);

/**
 * Remove custom claims for a user (remove wedding access)
 */
export const removeUserCustomClaims = onCall(
  standardFunctionConfig,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userId, weddingId } = request.data as RemoveCustomClaimsRequest & {
      weddingId: string;
    };

    if (!userId || !weddingId) {
      throw new HttpsError(
        "invalid-argument",
        "userId and weddingId are required"
      );
    }

    try {
      const auth = getAuth();
      const db = getFirestore();

      // Check permission (same as above)
      const weddingRef = db.collection("weddings").doc(weddingId);
      const weddingDoc = await weddingRef.get();

      if (!weddingDoc.exists) {
        throw new HttpsError("not-found", "Wedding not found");
      }

      const weddingData = weddingDoc.data();
      const requestingUserClaims = request.auth.token;

      const isAdmin = requestingUserClaims.admin === true;
      const hasWeddingAccess =
        requestingUserClaims.weddings?.includes(weddingId);
      const isWeddingOwner = weddingData?.createdBy === request.auth.uid;

      if (!isAdmin && !hasWeddingAccess && !isWeddingOwner) {
        throw new HttpsError(
          "permission-denied",
          "You don't have permission to manage this wedding"
        );
      }

      // Get current user claims
      const userRecord = await auth.getUser(userId);
      const currentClaims = userRecord.customClaims || {};

      // Remove wedding access
      const currentWeddings = (currentClaims.weddings || []).filter(
        (id: string) => id !== weddingId
      );
      const weddingRoles = { ...currentClaims.weddingRoles };
      delete weddingRoles[weddingId];

      // Update custom claims
      const updatedClaims = {
        ...currentClaims,
        weddings: currentWeddings,
        weddingRoles: weddingRoles,
      };

      await auth.setCustomUserClaims(userId, updatedClaims);

      // Remove user from wedding document
      const weddingMembers = (weddingData?.members || []).filter(
        (member: any) => member.uid !== userId
      );

      await weddingRef.update({
        members: weddingMembers,
        updatedAt: new Date().toISOString(),
      });

      logger.info("Custom claims removed successfully", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        weddingId,
      });

      return {
        success: true,
        message: "Custom claims removed successfully",
        userId,
        weddingId,
      };
    } catch (error) {
      logger.error("Failed to remove custom claims", {
        requestingUser: request.auth?.uid,
        targetUser: userId,
        weddingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to remove custom claims");
    }
  }
);

/**
 * Get user's custom claims (for debugging/verification)
 */
export const getUserCustomClaims = onCall(
  standardFunctionConfig,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { userId } = request.data as { userId?: string };
    const targetUserId = userId || request.auth.uid;

    try {
      const auth = getAuth();
      const userRecord = await auth.getUser(targetUserId);

      // Only allow users to see their own claims, unless they're admin
      if (targetUserId !== request.auth.uid && !request.auth.token.admin) {
        throw new HttpsError(
          "permission-denied",
          "You can only view your own custom claims"
        );
      }

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
 * Find user by email and optionally add them to a wedding
 */
export const findUserByEmail = onCall(
  standardFunctionConfig,
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { email, weddingId, role } = request.data as {
      email: string;
      weddingId?: string;
      role?: "bride" | "groom" | "admin";
    };

    if (!email) {
      throw new HttpsError("invalid-argument", "Email is required");
    }

    try {
      const auth = getAuth();

      // Find user by email
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error) {
        throw new HttpsError("not-found", "User not found with this email");
      }

      // If weddingId is provided, add user to wedding
      if (weddingId) {
        const db = getFirestore();
        const weddingRef = db.collection("weddings").doc(weddingId);
        const weddingDoc = await weddingRef.get();

        if (!weddingDoc.exists) {
          throw new HttpsError("not-found", "Wedding not found");
        }

        const weddingData = weddingDoc.data();
        const requestingUserClaims = request.auth.token;

        // Check permissions
        const isAdmin = requestingUserClaims.admin === true;
        const hasWeddingAccess =
          requestingUserClaims.weddings?.includes(weddingId);
        const isWeddingOwner = weddingData?.createdBy === request.auth.uid;

        if (!isAdmin && !hasWeddingAccess && !isWeddingOwner) {
          throw new HttpsError(
            "permission-denied",
            "You don't have permission to manage this wedding"
          );
        }

        // Update user's custom claims
        const currentClaims = userRecord.customClaims || {};
        const currentWeddings = currentClaims.weddings || [];
        const weddingRoles = currentClaims.weddingRoles || {};

        if (!currentWeddings.includes(weddingId)) {
          currentWeddings.push(weddingId);
        }

        if (role) {
          weddingRoles[weddingId] = role;
        }

        const updatedClaims = {
          ...currentClaims,
          weddings: currentWeddings,
          weddingRoles: weddingRoles,
        };

        await auth.setCustomUserClaims(userRecord.uid, updatedClaims);

        // Update wedding document
        const weddingMembers = weddingData?.members || [];
        if (
          !weddingMembers.some((member: any) => member.uid === userRecord.uid)
        ) {
          weddingMembers.push({
            uid: userRecord.uid,
            email: userRecord.email,
            role: role || "member",
            addedAt: new Date().toISOString(),
            addedBy: request.auth.uid,
          });

          await weddingRef.update({
            members: weddingMembers,
            updatedAt: new Date().toISOString(),
          });
        }

        logger.info("User found and added to wedding", {
          requestingUser: request.auth.uid,
          targetUser: userRecord.uid,
          email,
          weddingId,
          role,
        });
      }

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
        addedToWedding: !!weddingId,
        weddingId,
        role,
      };
    } catch (error) {
      logger.error("Failed to find user by email", {
        requestingUser: request.auth.uid,
        email,
        weddingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to find user");
    }
  }
);
