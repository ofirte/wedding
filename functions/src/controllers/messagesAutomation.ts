import { onSchedule } from "firebase-functions/scheduler";
import { logger } from "firebase-functions/v2";
import { SendAutomationsService } from "../services/sendAutomationsService";
import { twilioFunctionConfig } from "../common/config";
import { onCall } from "firebase-functions/https";

export const runMessagesAutomation = onSchedule(
  {
    schedule: "every 1 hours",
    ...twilioFunctionConfig,
  },
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

export const manualRunMessagesAutomation = onCall(
  {
    ...twilioFunctionConfig,
  },
  async (request) => {
    try {
      logger.info("Manual trigger for message automations started");
      const sendAutomationsService = new SendAutomationsService();
      await sendAutomationsService.processMessageAutomations();
      logger.info(
        "Manual trigger for message automations completed successfully"
      );
      return { success: true };
    } catch (error) {
      logger.error("Error in manual trigger for message automations", {
        error,
      });
      throw error;
    }
  }
);
