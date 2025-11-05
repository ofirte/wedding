import { onSchedule } from "firebase-functions/scheduler";
import { logger } from "firebase-functions/v2";
import { SendAutomationsService } from "../services/sendAutomationsService";
import { AutomationStatusService } from "../services/automationStatusService";
import { twilioFunctionConfig } from "../common/config";
import { onCall } from "firebase-functions/https";
import { getValidatedData, isAuthenticated } from "../common/utils";

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
      isAuthenticated(request);
      const { weddingId } = getValidatedData(request.data, ["weddingId"]);
      logger.info("Manual trigger for message automations started", {
        weddingId,
      });
      const sendAutomationsService = new SendAutomationsService();
      await sendAutomationsService.processMessageAutomations(weddingId);
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

export const updateAutomationStatuses = onSchedule(
  {
    schedule: "5 * * * *", // Run at 5 minutes past every hour (XX:05)
    ...twilioFunctionConfig,
  },
  async (context) => {
    try {
      logger.info("Automation status update scheduled task started");
      const automationStatusService = new AutomationStatusService();
      await automationStatusService.processAutomationStatusUpdates();
      logger.info(
        "Automation status update scheduled task completed successfully"
      );
    } catch (error) {
      logger.error("Error in automation status update scheduled task", {
        error,
      });
      throw error; // Re-throw to mark the function as failed
    }
  }
);

export const manualUpdateAutomationStatuses = onCall(
  {
    ...twilioFunctionConfig,
  },
  async (request) => {
    try {
      isAuthenticated(request);
      const { weddingId } = getValidatedData(request.data, ["weddingId"]);
      logger.info("Manual trigger for automation status updates started", {
        weddingId,
      });
      const automationStatusService = new AutomationStatusService();
      await automationStatusService.processAutomationStatusUpdates(weddingId);
      logger.info(
        "Manual trigger for automation status updates completed successfully"
      );
      return { success: true };
    } catch (error) {
      logger.error("Error in manual trigger for automation status updates", {
        error,
      });
      throw error;
    }
  }
);
