import { onCall } from "firebase-functions/v2/https";
import { twilioFunctionConfig } from "../common/config";
import {
  GetMessageTemplatesRequest,
  GetMessageTemplatesResponse,
  CreateMessageTemplateRequest,
  CreateMessageTemplateResponse,
  DeleteMessageTemplateRequest,
  DeleteMessageTemplateResponse,
  SubmitTemplateApprovalRequest,
  SubmitTemplateApprovalResponse,
  GetTemplateApprovalStatusRequest,
  GetTemplateApprovalStatusResponse,
} from "@wedding-plan/types";
import {
  getValidatedData,
  handleFunctionError,
  isAuthenticated,
} from "../common/utils";
import { TemplateService} from "../services/templateService";


/**
 * Get message templates from Twilio
 */
export const getMessageTemplates = onCall<GetMessageTemplatesRequest>(
  twilioFunctionConfig,
  async (request): Promise<GetMessageTemplatesResponse> => {
    const templateService = new TemplateService();
    isAuthenticated(request);
    
    try {
      const templates = await templateService.getMessageTemplates();

      return {
        success: true,
        templates: templates,
        count: templates.length,
      } as GetMessageTemplatesResponse;
    } catch (error) {
      handleFunctionError(
        error,
        { userId: request.auth.uid },
        "Failed to fetch message templates"
      );
    }
  }
);

/**
 * Create a new message template
 */
export const createMessageTemplate = onCall<CreateMessageTemplateRequest>(
  twilioFunctionConfig,
  async (request): Promise<CreateMessageTemplateResponse> => {

    const templateService = new TemplateService();
    isAuthenticated(request);
    const templateData = getValidatedData(request.data, [
      "friendly_name",
      "language",
      "variables",
      "types",
    ]);

    try {
      const template = await templateService.createMessageTemplate(
        templateData.friendly_name,
        templateData.language,
        templateData.variables,
        templateData.types
      );

      return {
        success: true,
        template: template,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId: request.auth.uid, templateData: request.data },
        "Failed to create message template"
      );
    }
  }
);

/**
 * Delete a message template
 */
export const deleteMessageTemplate = onCall<DeleteMessageTemplateRequest>(
  twilioFunctionConfig,
  async (request): Promise<DeleteMessageTemplateResponse> => {
    const templateService = new TemplateService();
    isAuthenticated(request);
    const { templateSid } = getValidatedData(request.data, ["templateSid"]);

    try {
      await templateService.deleteMessageTemplate(templateSid);

      return {
        success: true,
        message: "Template deleted successfully",
        templateSid: templateSid,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId: request.auth.uid, templateSid },
        "Failed to delete message template"
      );
    }
  }
);

/**
 * Submit template for WhatsApp approval
 */
export const submitTemplateApproval = onCall<SubmitTemplateApprovalRequest>(
  twilioFunctionConfig,
  async (request): Promise<SubmitTemplateApprovalResponse> => {
    const templateService = new TemplateService();
    isAuthenticated(request);
    const approvalData = getValidatedData(request.data, [
      "templateSid",
      "name",
      "category",
    ]);

    try {
      const approvalRequest = await templateService.submitTemplateApproval(
        approvalData.templateSid,
        approvalData.name,
        approvalData.category
      );

      return {
        success: true,
        approvalRequest: approvalRequest,
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId: request.auth.uid, ...request.data },
        "Failed to submit template for approval"
      );
    }
  }
);

/**
 * Get template approval status
 */
export const getTemplateApprovalStatus =
  onCall<GetTemplateApprovalStatusRequest>(
    twilioFunctionConfig,
    async (request): Promise<GetTemplateApprovalStatusResponse> => {
      const templateService = new TemplateService();
      isAuthenticated(request);
      const { templateSid } = getValidatedData(request.data, ["templateSid"]);

      try {
        const approvalData = await templateService.getTemplateApprovalStatus(
          templateSid
        );

        return {
          success: true,
          templateSid: templateSid,
          approvalData: approvalData,
        };
      } catch (error) {
        handleFunctionError(
          error,
          { userId: request.auth.uid, templateSid },
          "Failed to fetch template approval status"
        );
      }
    }
  );
