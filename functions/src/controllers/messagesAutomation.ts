import { onSchedule } from "firebase-functions/scheduler";
import { logger } from "firebase-functions/v2";
import { SendAutomationsService } from "../services/sendAutomationsService";

export const runMessagesAutomation = onSchedule(
  "every 1 hours",
  async (context) => {
    try {
      logger.info("Message automation scheduled task started");
      const sendAutomationsService = new SendAutomationsService();
      await sendAutomationsService.processMessageAutomations();
      logger.info("Message automation scheduled task completed successfully");
    } catch (error) {
      logger.error("Error in message automation scheduled task", { error });
      throw error; // Re-throw to mark the function as failed
    }
  }
);
