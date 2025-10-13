import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../common/config";
import { isAuthenticated, isSufficientWeddingRole } from "../common/utils";
import { WeddingRoles } from "../shared/types";
import { DeleteUserAuthRequest, DeleteUserAuthResponse } from "../shared";

export const deleteUserAuth = onCall<DeleteUserAuthRequest>(
  standardFunctionConfig,
  async (request): Promise<DeleteUserAuthResponse> => {
    isAuthenticated(request);
    isSufficientWeddingRole({
      userRole: request.auth.token.role,
      neededRole: WeddingRoles.ADMIN,
    });
    const { userId } = request.data;

    if (!userId) {
      throw new HttpsError("invalid-argument", "userId is required");
    }

    try {
      const auth = getAuth();
      await auth.deleteUser(userId);

      logger.info("User deleted successfully", {
        requestingUser: request.auth.uid,
        deletedUser: userId,
      });

      return {
        success: true,
        message: `User ${userId} deleted successfully`,
        userId,
      } as DeleteUserAuthResponse;
    } catch (error) {
      logger.error("Failed to delete user", {
        requestingUser: request.auth.uid,
        targetUser: userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to delete user");
    }
  }
);
