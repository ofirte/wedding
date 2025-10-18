import { logger } from "firebase-functions/v2";
import {
  SendMessagesAutomationModel,
  WeddingModel,
  InviteeModel,
  FilterOptions,
} from "../models";
import {
  SendMessagesAutomation,
  Wedding,
  Invitee,
  SendMessageResponse,
} from "@wedding-plan/types";
import { MessageService } from "./messageService";
import { populateContentVariables } from "./variablesService";

/**
 * Automation Service Class
 * Example of Option 1: Class-based service with model properties
 */
export class SendAutomationsService {
  // Initialize models once as class properties (RECOMMENDED APPROACH)
  private sendMessagesAutomationModel: SendMessagesAutomationModel;
  private messageService: MessageService;
  private weddingModel: WeddingModel;
  private inviteeModel: InviteeModel;
  constructor() {
    this.sendMessagesAutomationModel = new SendMessagesAutomationModel();
    this.messageService = new MessageService();
    this.weddingModel = new WeddingModel();
    this.inviteeModel = new InviteeModel();
  }
  /**
   * Get all automations for a wedding
   */
  async getAutomationsToRun(
    weddingId: string
  ): Promise<SendMessagesAutomation[]> {
    try {
      logger.info("Getting automations to run", { weddingId });
      const halfAnHourAgo = new Date(Date.now() - 30 * 60 * 1000);
      const halfAnHourFromNow = new Date(Date.now() + 30 * 60 * 1000);
      const filters: FilterOptions[] = [
        { field: "isActive", operator: "==", value: true },
        { field: "status", operator: "==", value: "pending" },
        {
          field: "scheduledTime",
          operator: ">=",
          value: halfAnHourAgo,
        },
        {
          field: "scheduledTime",
          operator: "<=",
          value: halfAnHourFromNow,
        },
      ];

      const automations = await this.sendMessagesAutomationModel.getByFilter(
        filters,
        weddingId
      );

      logger.info("Found automations to run", {
        weddingId,
        count: automations.length,
      });

      return automations;
    } catch (error) {
      logger.error("Error getting active automations", { weddingId, error });
      throw error;
    }
  }

  /**
   * Create a new automation
   */
  async createAutomation(
    automationData: Omit<SendMessagesAutomation, "id">,
    weddingId: string
  ): Promise<SendMessagesAutomation> {
    try {
      logger.info("Creating automation", {
        weddingId,
        name: automationData.name,
      });

      const automation = await this.sendMessagesAutomationModel.create(
        automationData,
        weddingId
      );

      logger.info("Created automation successfully", {
        weddingId,
        automationId: automation.id,
      });

      return automation;
    } catch (error) {
      logger.error("Error creating automation", { weddingId, error });
      throw error;
    }
  }

  /**
   * Update automation status
   */
  async updateAutomationStatus(
    automationId: string,
    status: string,
    weddingId: string,
    messages: SendMessageResponse[] = []
  ): Promise<SendMessagesAutomation> {
    try {
      logger.info("Updating automation status", {
        automationId,
        status,
        weddingId,
      });

      const updatedAutomation = await this.sendMessagesAutomationModel.update(
        automationId,
        {
          status: status as any,
          sentMessagesIds: messages.map((m) => m.messageSid),
        },
        weddingId
      );

      logger.info("Updated automation status successfully", {
        automationId,
        status,
      });

      return updatedAutomation;
    } catch (error) {
      logger.error("Error updating automation status", {
        automationId,
        status,
        weddingId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get target audience for automation
   */
  async getTargetAudience(
    weddingId: string,
    filters: any = {}
  ): Promise<Invitee[]> {
    try {
      logger.info("Getting target audience", { weddingId, filters });

      const inviteeFilters: FilterOptions[] = [];

      // Add attendance filter if specified
      if (filters.attendance !== undefined) {
        inviteeFilters.push({
          field: "rsvpStatus.attendance",
          operator: "==",
          value: filters.attendance,
        });
      }

      const invitees = await this.inviteeModel.getByFilter(
        inviteeFilters,
        weddingId
      );

      logger.info("Found target audience", {
        weddingId,
        count: invitees.length,
      });

      return invitees;
    } catch (error) {
      logger.error("Error getting target audience", { weddingId, error });
      throw error;
    }
  }

  /**
   * Get wedding details
   */
  async getWeddingDetails(weddingId: string): Promise<Wedding | null> {
    try {
      logger.info("Getting wedding details", { weddingId });

      const wedding = await this.weddingModel.getById(weddingId);

      if (wedding) {
        logger.info("Found wedding details", { weddingId, name: wedding.name });
      } else {
        logger.warn("Wedding not found", { weddingId });
      }

      return wedding;
    } catch (error) {
      logger.error("Error getting wedding details", { weddingId, error });
      throw error;
    }
  }

  /**
   * Main processing function - simplified example
   */
  async processMessageAutomations(): Promise<void> {
    try {
      logger.info("Starting message automations processing");

      // Get all weddings
      const weddings = await this.weddingModel.getAll();

      for (const wedding of weddings) {
        try {
          // Get automations to run for this wedding
          const automationsToRun = await this.getAutomationsToRun(wedding.id);

          for (const automation of automationsToRun) {
            try {
              // Get target audience
              const targetAudience = await this.getTargetAudience(
                wedding.id,
                automation.targetAudienceFilter
              );
              const messages = await Promise.all(
                targetAudience.map((invitee) => {
                  const populatedVariables = populateContentVariables(
                    invitee,
                    wedding
                  );
                  return this.messageService.sendWhatsAppMessage({
                    contentSid: automation.messageTemplateId,
                    to: invitee.cellphone,
                    contentVariables: populatedVariables,
                    weddingId: wedding.id,
                  });
                })
              );

              // Send messages
              // Mark as in progress
              await this.updateAutomationStatus(
                automation.id,
                "inProgress",
                wedding.id,
                messages
              );

              logger.info("Processing automation", {
                automationId: automation.id,
                weddingId: wedding.id,
                targetCount: targetAudience.length,
              });
            } catch (automationError) {
              logger.error("Error processing automation", {
                automationId: automation.id,
                weddingId: wedding.id,
                error: automationError,
              });

              // Mark as failed
              await this.updateAutomationStatus(
                automation.id,
                "failed",
                wedding.id
              );
            }
          }
        } catch (weddingError) {
          logger.error("Error processing wedding", {
            weddingId: wedding.id,
            error: weddingError,
          });
        }
      }

      logger.info("Message automations processing completed");
    } catch (error) {
      logger.error("Error in message automations processing", { error });
      throw error;
    }
  }
}
