import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";

/**
 * Initialize Firebase Admin SDK with environment-specific configuration
 * Uses service account key for local development, default initialization for production
 */
export const initializeFirebaseAdmin = (): void => {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    logger.info("Firebase Admin SDK already initialized");
    return;
  }

  try {
    // Determine environment
    const isLocal =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      process.env.NODE_ENV === "development";

    const projectId =
      process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
    const environment = projectId?.includes("prod")
      ? "production"
      : "development";

    if (isLocal) {
      // Local development: use service account key
      logger.info(
        "Initializing Firebase Admin for local development with service account"
      );

      try {
        // Try to load service account key for local development
        const serviceAccount = require("../../serviceAccountKey.json");

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        logger.info(
          `Firebase Admin initialized locally for project: ${projectId}`
        );
      } catch (serviceAccountError) {
        // Fallback to default initialization if service account key is not found
        logger.warn(
          "Service account key not found, falling back to default initialization"
        );
        admin.initializeApp();
        logger.info(
          `Firebase Admin initialized with default credentials for project: ${projectId}`
        );
      }
    } else {
      // Production/deployed environment: use default initialization
      logger.info("Initializing Firebase Admin for deployed environment");
      admin.initializeApp();
      logger.info(
        `Firebase Admin initialized for ${environment} environment, project: ${projectId}`
      );
    }
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin SDK", {
      error: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.NODE_ENV,
      isEmulator: process.env.FUNCTIONS_EMULATOR,
      projectId: process.env.GCLOUD_PROJECT,
    });
    throw error;
  }
};
