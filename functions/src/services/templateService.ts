import { logger } from "firebase-functions/v2";
import { initializeTwilioClient } from "../common/twilioUtils";
import {
  Template,
  TemplateApprovalResponse,
  TemplateApprovalStatusData,
} from "@wedding-plan/types";
import { ContentInstance as ContentInstanceV2 } from "twilio/lib/rest/content/v2/content";
import { ContentInstance as ContentInstanceV1 } from "twilio/lib/rest/content/v1/content";

// Helper function to convert Twilio content response to our Template type
const convertTwilioToTemplate = (
  twilioContent: ContentInstanceV1 | ContentInstanceV2
): Template => {
  return {
    sid: twilioContent.sid,
    friendlyName: twilioContent.friendlyName || "",
    language: twilioContent.language || "",
    variables: (twilioContent.variables || {}) as unknown as Record<
      string,
      string
    >,
    types: twilioContent.types || {},
    dateCreated:
      twilioContent.dateCreated?.toISOString() || new Date().toISOString(),
    dateUpdated:
      twilioContent.dateUpdated?.toISOString() || new Date().toISOString(),
    accountSid: twilioContent.accountSid || "",
  };
};

// Helper function to convert Twilio approval response to our type
const convertTwilioApprovalResponse = (
  twilioApproval: any
): TemplateApprovalResponse => {
  return {
    category: twilioApproval.category || "",
    status: twilioApproval.status || "pending",
    rejection_reason: twilioApproval.rejection_reason,
    name: twilioApproval.name || "",
    content_type: twilioApproval.content_type || "",
  };
};

/**
 * Template Service Class
 * Handles Twilio template operations using class-based pattern
 */ 
export class TemplateService {
  /**
   * Get message templates from Twilio
   */
  async getMessageTemplates(): Promise<Template[]> {
    try {
      logger.info("Fetching message templates");

      const twilioClient = initializeTwilioClient();
      const contentList = await twilioClient.content.v2.contents.list();
      const cleanTemplates = contentList.map(convertTwilioToTemplate);

      logger.info("Templates fetched successfully", {
        count: cleanTemplates.length,
      });

      return cleanTemplates;
    } catch (error) {
      logger.error("Failed to fetch message templates", { error });
      throw error;
    }
  }

  /**
   * Create a new message template
   */
  async createMessageTemplate(
    friendly_name: string,
    language: string,
    variables: Record<string, string>,
    types: any
  ): Promise<Template> {
    try {
      logger.info("Creating message template", {
        friendly_name,
        language,
      });

      const twilioClient = initializeTwilioClient();
      const createdTemplate = await twilioClient.content.v1.contents.create({
        friendly_name: friendly_name,
        language: language,
        variables: variables || {},
        types: types,
      });
      const cleanTemplate = convertTwilioToTemplate(createdTemplate);

      logger.info("Template created successfully", {
        templateSid: createdTemplate.sid,
        friendly_name,
      });

      return cleanTemplate;
    } catch (error) {
      logger.error("Failed to create message template", {
        friendly_name,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete a message template
   */
  async deleteMessageTemplate(templateSid: string): Promise<void> {
    try {
      logger.info("Deleting message template", {
        templateSid,
      });

      const twilioClient = initializeTwilioClient();
      await twilioClient.content.v1.contents(templateSid).remove();

      logger.info("Template deleted successfully", {
        templateSid,
      });
    } catch (error) {
      logger.error("Failed to delete message template", {
        templateSid,
        error,
      });
      throw error;
    }
  }

  /**
   * Submit template for WhatsApp approval
   */
  async submitTemplateApproval(
    templateSid: string,
    name: string,
    category: string
  ): Promise<TemplateApprovalResponse> {
    try {
      logger.info("Submitting template for approval", {
        templateSid,
        name,
        category,
      });

      const twilioClient = initializeTwilioClient();
      const response = await twilioClient.content.request({
        method: "post",
        headers: { "Content-Type": "application/json" },
        uri: `v1/Content/${templateSid}/ApprovalRequests/whatsapp`,
        data: { name: name, category: category },
      });

      if (response.statusCode !== 201) {
        const errorData = response.body;
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const twilioApprovalResponse = response.body;
      const approvalRequest = convertTwilioApprovalResponse(
        twilioApprovalResponse
      );

      logger.info("Template submitted for approval", {
        templateSid,
        approvalStatus: approvalRequest.status,
      });

      return approvalRequest;
    } catch (error) {
      logger.error("Failed to submit template for approval", {
        templateSid,
        name,
        category,
        error,
      });
      throw error;
    }
  }

  /**
   * Get template approval status
   */
  async getTemplateApprovalStatus(
    templateSid: string
  ): Promise<TemplateApprovalStatusData> {
    try {
      logger.info("Fetching approval status", {
        templateSid,
      });

      const twilioClient = initializeTwilioClient();
      const response = await twilioClient.content.request({
        method: "get",
        uri: `v1/Content/${templateSid}/ApprovalRequests`,
      });

      if (response.statusCode !== 200) {
        const errorData = response.body;
        throw new Error(`HTTP ${response.statusCode}: ${errorData}`);
      }

      const twilioApprovalData = await response.body;

      // Convert to our type structure
      const approvalData: TemplateApprovalStatusData = {
        url: twilioApprovalData.url || "",
        whatsapp: twilioApprovalData.whatsapp
          ? convertTwilioApprovalResponse(twilioApprovalData.whatsapp)
          : undefined,
        account_sid: twilioApprovalData.account_sid || "",
        sid: twilioApprovalData.sid || "",
      };

      logger.info("Approval status fetched successfully", {
        templateSid,
      });

      return approvalData;
    } catch (error) {
      logger.error("Failed to fetch template approval status", {
        templateSid,
        error,
      });
      throw error;
    }
  }
}