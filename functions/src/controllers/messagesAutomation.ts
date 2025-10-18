import { onSchedule } from "firebase-functions/scheduler";
import { initializeFirebaseAdmin } from "src/common/firebaseAdmin";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { processMessageAutomations } from "../services/automationService";

export const runMessagesAutomation = onSchedule(
  "every 1 hours",
  async (context) => {
    try {
      logger.info("Message automation scheduled task started");

      // Initialize Firebase Admin
      initializeFirebaseAdmin();
      const db = admin.firestore();

      // Delegate all business logic to the service
      await processMessageAutomations(db);

      logger.info("Message automation scheduled task completed successfully");
    } catch (error) {
      logger.error("Error in message automation scheduled task", { error });
      throw error; // Re-throw to mark the function as failed
    }
  }
);
