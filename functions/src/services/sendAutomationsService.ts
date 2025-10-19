import { logger } from "firebase-functions/v2";
import {
  SendMessagesAutomationModel,
  WeddingModel,
  InviteeModel,
  FilterOptions,
  TemplateModel,
} from "../models";
import {
  SendMessagesAutomation,
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
  private templateModel: TemplateModel;
  constructor() {
    this.sendMessagesAutomationModel = new SendMessagesAutomationModel();
    this.messageService = new MessageService();
    this.weddingModel = new WeddingModel();
    this.inviteeModel = new InviteeModel();
    this.templateModel = new TemplateModel();
  }

  async getAutomationsToRun(
    weddingId: string
  ): Promise<SendMessagesAutomation[]> {
    try {
      logger.info("Getting automations to run", { weddingId });
      // Use UTC time for comparison since scheduledTime is stored in UTC
      const now = new Date();
      const halfAnHourFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      logger.info("Checking automations", {
        weddingId,
        currentUTC: now.toISOString(),
        cutoffUTC: halfAnHourFromNow.toISOString(),
      });

      const filters: FilterOptions[] = [
        { field: "isActive", operator: "==", value: true },
        { field: "status", operator: "==", value: "pending" },
        {
          field: "scheduledTime",
          operator: "<=",
          value: halfAnHourFromNow,
        },
      ];
      const allWeddingAutomations =
        await this.sendMessagesAutomationModel.getAll(weddingId);
      ``;
      logger.info("All wedding automations", {
        weddingId,
        count: allWeddingAutomations.length,
      });
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
    automationData: Omit<SendMessagesAutomation, "id"> & {
      scheduledTimeZone?: string;
    },
    weddingId: string
  ): Promise<SendMessagesAutomation> {
    try {
      logger.info("Creating automation", {
        weddingId,
        name: automationData.name,
        scheduledTimeUTC: automationData.scheduledTime.toISOString(),
        scheduledTimeZone: automationData.scheduledTimeZone,
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
      const invitees = await this.inviteeModel.getAll(weddingId);
      const targetInvitees = invitees.filter(
        (invitee) => invitee?.rsvpStatus?.attendance === filters.attendance
      );
      logger.info("Found target audience", {
        weddingId,
        count: targetInvitees.length,
      });

      return targetInvitees;
    } catch (error) {
      logger.error("Error getting target audience", { weddingId, error });
      throw error;
    }
  }

  async getTemplateLanguage(
    templateSid: string,
    weddingId: string
  ): Promise<"en" | "he"> {
    try {
      logger.info("Getting template language", { templateSid, weddingId });

      const template = await this.templateModel.getByFilter(
        [
          {
            field: "sid",
            operator: "==",
            value: templateSid,
          },
        ],
        weddingId
      );

      if (template.length > 0) {
        logger.info("Found template", {
          templateSid,
          weddingId,
          language: template[0].language,
        });
        return template[0].language as "en" | "he";
      } else {
        logger.error("Template not found", { templateSid, weddingId });
        throw new Error("Template not found");
      }
    } catch (error) {
      logger.error("Error getting template language", {
        templateSid,
        weddingId,
        error,
      });
      throw error;
    }
  }

  /**
   * Main processing function - simplified example
   */
  async processMessageAutomations(weddingId?: string): Promise<void> {
    try {
      logger.info("Starting message automations processing", { weddingId });

      // Get weddings - either specific one or all
      let weddings;
      if (weddingId) {
        const wedding = await this.weddingModel.getById(weddingId);
        weddings = wedding ? [wedding] : [];
      } else {
        weddings = await this.weddingModel.getAll();
      }
      for (const wedding of weddings) {
        try {
          // Get automations to run for this wedding
          const automationsToRun = await this.getAutomationsToRun(wedding.id);

          for (const automation of automationsToRun) {
            try {
              const templateLanguage = await this.getTemplateLanguage(
                automation.messageTemplateId,
                wedding.id
              );
              const targetAudience = await this.getTargetAudience(
                wedding.id,
                automation.targetAudienceFilter
              );
              const messages = await Promise.all(
                targetAudience.map((invitee) => {
                  const populatedVariables = populateContentVariables(
                    invitee,
                    wedding,
                    templateLanguage
                  );
                  return this.messageService.sendWhatsAppMessage({
                    contentSid: automation.messageTemplateId,
                    to: this.messageService.normalizeWhatsappPhoneNumber(
                      invitee.cellphone
                    ),
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
