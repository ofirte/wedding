import { logger } from "firebase-functions/v2";
import { SendMessagesAutomationModel, WeddingModel } from "../models";
import { SendMessagesAutomation } from "@wedding-plan/types";
import { initializeTwilioClient } from "../common/twilioUtils";
import { FilterOptions } from "../models/baseModel/ModelCRUD";

/**
 * Service to track and update automation statuses based on message delivery
 */
export class AutomationStatusService {
  private sendMessagesAutomationModel: SendMessagesAutomationModel;
  private weddingModel: WeddingModel;
  private twilioClient: any;

  constructor() {
    this.sendMessagesAutomationModel = new SendMessagesAutomationModel();
    this.weddingModel = new WeddingModel();
    this.twilioClient = initializeTwilioClient();
  }

  /**
   * Get all inProgress automations across all weddings
   */
  async getInProgressAutomations(): Promise<
    Array<{ automation: SendMessagesAutomation; weddingId: string }>
  > {
    try {
      logger.info("Getting all inProgress automations");

      // Get all weddings (for now using the hardcoded wedding ID like the main service)
      const weddings = await this.weddingModel.getAll();

      const allInProgressAutomations: Array<{
        automation: SendMessagesAutomation;
        weddingId: string;
      }> = [];

      for (const wedding of weddings) {
        const filters: FilterOptions[] = [
          { field: "status", operator: "==", value: "inProgress" },
        ];

        const automations = await this.sendMessagesAutomationModel.getByFilter(
          filters,
          wedding.id
        );

        for (const automation of automations) {
          allInProgressAutomations.push({
            automation,
            weddingId: wedding.id,
          });
        }
      }

      logger.info("Found inProgress automations", {
        count: allInProgressAutomations.length,
      });

      return allInProgressAutomations;
    } catch (error) {
      logger.error("Error getting inProgress automations", { error });
      throw error;
    }
  }

  /**
   * Check the status of messages for a specific automation using Twilio API
   */
  async checkMessageStatuses(messageIds: string[]): Promise<
    Array<{
      messageSid: string;
      status: string;
      errorCode?: string;
      errorMessage?: string;
    }>
  > {
    try {
      logger.info("Checking message statuses via Twilio API", {
        messageCount: messageIds.length,
      });

      const messageStatuses = await Promise.allSettled(
        messageIds.map(async (messageSid) => {
          try {
            const message = await this.twilioClient
              .messages(messageSid)
              .fetch();
            return {
              messageSid,
              status: message.status,
              errorCode: message.errorCode,
              errorMessage: message.errorMessage,
            };
          } catch (error) {
            logger.warn("Failed to fetch message status", {
              messageSid,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            return {
              messageSid,
              status: "unknown",
              errorCode: "fetch_failed",
              errorMessage: "Failed to fetch status from Twilio",
            };
          }
        })
      );

      const results = messageStatuses
        .map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            logger.error("Promise rejected for message status check", {
              messageSid: messageIds[index],
              error: result.reason,
            });
            return {
              messageSid: messageIds[index],
              status: "unknown",
              errorCode: "promise_rejected",
              errorMessage: "Promise rejected during status check",
            };
          }
        })
        .filter(Boolean);

      logger.info("Successfully checked message statuses", {
        total: messageIds.length,
        successful: results.filter((r) => r.status !== "unknown").length,
      });

      return results;
    } catch (error) {
      logger.error("Error checking message statuses", { error });
      throw error;
    }
  }

  /**
   * Determine automation completion status based on message statuses
   */
  determineAutomationStatus(
    messageStatuses: Array<{
      messageSid: string;
      status: string;
      errorCode?: string;
      errorMessage?: string;
    }>
  ): {
    automationStatus: "completed" | "failed";
    successfulMessages: number;
    failedMessages: number;
    failureDetails?: Array<{
      messageSid: string;
      errorCode?: string;
      errorMessage?: string;
    }>;
  } {
    // Define successful Twilio message statuses
    const successfulStatuses = ["sent", "delivered", "read"];

    // Define failed/error statuses
    const failedStatuses = ["failed", "undelivered"];

    const successfulMessages = messageStatuses.filter((msg) =>
      successfulStatuses.includes(msg.status)
    );

    const failedMessages = messageStatuses.filter(
      (msg) =>
        failedStatuses.includes(msg.status) ||
        msg.errorCode ||
        msg.status === "unknown"
    );

    const pendingMessages = messageStatuses.filter(
      (msg) =>
        !successfulStatuses.includes(msg.status) &&
        !failedStatuses.includes(msg.status) &&
        !msg.errorCode &&
        msg.status !== "unknown"
    );

    logger.info("Message status breakdown", {
      total: messageStatuses.length,
      successful: successfulMessages.length,
      failed: failedMessages.length,
      pending: pendingMessages.length,
    });

    // If there are any pending messages, keep automation as inProgress
    if (pendingMessages.length > 0) {
      return {
        automationStatus: "completed", // We'll return completed but won't update yet
        successfulMessages: successfulMessages.length,
        failedMessages: failedMessages.length,
      };
    }

    // If all messages are either successful or failed, determine final status
    const hasFailures = failedMessages.length > 0;
    const automationStatus: "completed" | "failed" = hasFailures
      ? "failed"
      : "completed";

    const result = {
      automationStatus,
      successfulMessages: successfulMessages.length,
      failedMessages: failedMessages.length,
      ...(hasFailures
        ? {
            failureDetails: failedMessages.map((msg) => ({
              messageSid: msg.messageSid,
              errorCode: msg.errorCode,
              errorMessage: msg.errorMessage,
            })),
          }
        : {}),
    };

    return result;
  }

  /**
   * Update automation with final status and failure details if applicable
   */
  async updateAutomationWithStatus(
    automationId: string,
    weddingId: string,
    statusResult: {
      automationStatus: "completed" | "failed";
      successfulMessages: number;
      failedMessages: number;
      failureDetails?: Array<{
        messageSid: string;
        errorCode?: string;
        errorMessage?: string;
      }>;
    }
  ): Promise<SendMessagesAutomation> {
    try {
      logger.info("Updating automation with final status", {
        automationId,
        weddingId,
        status: statusResult.automationStatus,
        successfulMessages: statusResult.successfulMessages,
        failedMessages: statusResult.failedMessages,
      });

      const updateData: any = {
        status: statusResult.automationStatus,
        updatedAt: new Date(),
        completionStats: {
          successfulMessages: statusResult.successfulMessages,
          failedMessages: statusResult.failedMessages,
          completedAt: new Date(),
        },
      };

      // Add failure details if there were failures
      if (
        statusResult.automationStatus === "failed" &&
        statusResult.failureDetails
      ) {
        updateData.failureDetails = statusResult.failureDetails;
      }

      const updatedAutomation = await this.sendMessagesAutomationModel.update(
        automationId,
        updateData,
        weddingId
      );

      logger.info("Successfully updated automation status", {
        automationId,
        status: statusResult.automationStatus,
      });

      return updatedAutomation;
    } catch (error) {
      logger.error("Error updating automation status", {
        automationId,
        weddingId,
        error,
      });
      throw error;
    }
  }

  /**
   * Main processing function to check and update all inProgress automations
   */
  async processAutomationStatusUpdates(): Promise<void> {
    try {
      logger.info("Starting automation status updates processing");

      const inProgressAutomations = await this.getInProgressAutomations();

      if (inProgressAutomations.length === 0) {
        logger.info("No inProgress automations found");
        return;
      }

      for (const { automation, weddingId } of inProgressAutomations) {
        try {
          logger.info("Processing automation status", {
            automationId: automation.id,
            weddingId,
            messageCount: automation.sentMessagesIds.length,
          });

          if (
            !automation.sentMessagesIds ||
            automation.sentMessagesIds.length === 0
          ) {
            logger.warn("Automation has no sent messages", {
              automationId: automation.id,
            });
            continue;
          }

          // Check message statuses via Twilio API
          const messageStatuses = await this.checkMessageStatuses(
            automation.sentMessagesIds
          );

          // Determine final automation status
          const statusResult = this.determineAutomationStatus(messageStatuses);

          // Only update if all messages have final status (no pending)
          const hasPendingMessages = messageStatuses.some((msg) => {
            const successfulStatuses = ["sent", "delivered", "read"];
            const failedStatuses = ["failed", "undelivered"];
            return (
              !successfulStatuses.includes(msg.status) &&
              !failedStatuses.includes(msg.status) &&
              !msg.errorCode &&
              msg.status !== "unknown"
            );
          });

          if (!hasPendingMessages) {
            await this.updateAutomationWithStatus(
              automation.id,
              weddingId,
              statusResult
            );
          } else {
            logger.info(
              "Automation still has pending messages, skipping update",
              {
                automationId: automation.id,
              }
            );
          }
        } catch (automationError) {
          logger.error("Error processing automation status", {
            automationId: automation.id,
            weddingId,
            error: automationError,
          });
        }
      }

      logger.info("Automation status updates processing completed");
    } catch (error) {
      logger.error("Error in automation status updates processing", { error });
      throw error;
    }
  }
}
