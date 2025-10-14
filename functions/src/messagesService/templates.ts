import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import twilio from "twilio";
import {
  twilioAccountSid,
  twilioAuthToken,
  twilioFunctionConfig,
} from "../common/config";
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
  Template,
  TemplateApprovalResponse,
  TemplateApprovalStatusData,
} from "../shared";

// Helper function to initialize Twilio client
const initializeTwilioClient = () => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  return accountSid && authToken ? twilio(accountSid, authToken) : null;
};

// Helper function to convert Twilio content response to our Template type
const convertTwilioToTemplate = (twilioContent: any): Template => {
  return {
    sid: twilioContent.sid,
    friendlyName: twilioContent.friendlyName || "",
    language: twilioContent.language || "",
    variables: twilioContent.variables || {},
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
 * Get message templates from Twilio
 */
export const getMessageTemplates = onCall<GetMessageTemplatesRequest>(
  twilioFunctionConfig,
  async (request): Promise<GetMessageTemplatesResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const twilioClient = initializeTwilioClient();
    if (!twilioClient) {
      throw new HttpsError(
        "failed-precondition",
        "Twilio client not configured"
      );
    }

    try {
      logger.info("Fetching message templates", {
        userId: request.auth.uid,
      });

      const contentList = await twilioClient.content.v2.contents.list();

      // Convert Twilio response to our Template type
      const cleanTemplates = contentList.map(convertTwilioToTemplate);

      logger.info("Templates fetched successfully", {
        userId: request.auth.uid,
        count: cleanTemplates.length,
      });

      return {
        success: true,
        templates: cleanTemplates,
        count: cleanTemplates.length,
      } as GetMessageTemplatesResponse;
    } catch (error) {
      logger.error("Failed to fetch templates", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new HttpsError("internal", "Failed to fetch message templates");
    }
  }
);

/**
 * Create a new message template
 */
export const createMessageTemplate = onCall<CreateMessageTemplateRequest>(
  twilioFunctionConfig,
  async (request): Promise<CreateMessageTemplateResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { friendly_name, language, variables, types } = request.data;

    // Validate required fields
    if (!friendly_name || !language) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: friendly_name and language"
      );
    }

    if (!types || Object.keys(types).length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "At least one content type must be provided"
      );
    }

    const twilioClient = initializeTwilioClient();
    if (!twilioClient) {
      throw new HttpsError(
        "failed-precondition",
        "Twilio client not configured"
      );
    }

    try {
      logger.info("Creating message template", {
        userId: request.auth.uid,
        friendly_name,
        language,
      });

      const createdTemplate = await twilioClient.content.v1.contents.create({
        friendly_name: friendly_name,
        language: language,
        variables: variables || {},
        types: types,
      });

      logger.info("Template created successfully", {
        userId: request.auth.uid,
        templateSid: createdTemplate.sid,
        friendly_name,
      });

      // Convert Twilio response to our Template type
      const cleanTemplate = convertTwilioToTemplate(createdTemplate);

      return {
        success: true,
        template: cleanTemplate,
      };
    } catch (error) {
      logger.error("Failed to create template", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        friendly_name,
        language,
      });

      throw new HttpsError("internal", "Failed to create message template");
    }
  }
);

/**
 * Delete a message template
 */
export const deleteMessageTemplate = onCall<DeleteMessageTemplateRequest>(
  twilioFunctionConfig,
  async (request): Promise<DeleteMessageTemplateResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { templateSid } = request.data;

    if (!templateSid) {
      throw new HttpsError("invalid-argument", "Template SID is required");
    }

    const twilioClient = initializeTwilioClient();
    if (!twilioClient) {
      throw new HttpsError(
        "failed-precondition",
        "Twilio client not configured"
      );
    }

    try {
      logger.info("Deleting message template", {
        userId: request.auth.uid,
        templateSid,
      });

      await twilioClient.content.v1.contents(templateSid).remove();

      logger.info("Template deleted successfully", {
        userId: request.auth.uid,
        templateSid,
      });

      return {
        success: true,
        message: "Template deleted successfully",
        templateSid: templateSid,
      };
    } catch (error) {
      logger.error("Failed to delete template", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        templateSid,
      });

      if (error instanceof Error && error.message.includes("not found")) {
        throw new HttpsError("not-found", "Template not found");
      }

      throw new HttpsError("internal", "Failed to delete message template");
    }
  }
);

/**
 * Submit template for WhatsApp approval
 */
export const submitTemplateApproval = onCall<SubmitTemplateApprovalRequest>(
  twilioFunctionConfig,
  async (request): Promise<SubmitTemplateApprovalResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { templateSid, name, category } = request.data;

    if (!templateSid) {
      throw new HttpsError("invalid-argument", "Template SID is required");
    }

    if (!name || !category) {
      throw new HttpsError(
        "invalid-argument",
        "Both 'name' and 'category' are required for WhatsApp approval"
      );
    }

    try {
      logger.info("Submitting template for approval", {
        userId: request.auth.uid,
        templateSid,
        name,
        category,
      });

      const accountSid = twilioAccountSid.value();
      const authToken = twilioAuthToken.value();
      const url = `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests/whatsapp`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        },
        body: JSON.stringify({ name: name, category: category }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const twilioApprovalResponse = await response.json();

      // Convert Twilio response to our type
      const approvalRequest = convertTwilioApprovalResponse(
        twilioApprovalResponse
      );

      logger.info("Template submitted for approval", {
        userId: request.auth.uid,
        templateSid,
        approvalStatus: approvalRequest.status,
      });

      return {
        success: true,
        approvalRequest: approvalRequest,
      };
    } catch (error) {
      logger.error("Failed to submit template for approval", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        templateSid,
        name,
        category,
      });

      if (error instanceof Error && error.message.includes("not found")) {
        throw new HttpsError("not-found", "Template not found");
      }

      throw new HttpsError(
        "internal",
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
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
      }

      const { templateSid } = request.data;

      if (!templateSid) {
        throw new HttpsError("invalid-argument", "Template SID is required");
      }

      try {
        logger.info("Fetching approval status", {
          userId: request.auth.uid,
          templateSid,
        });

        const accountSid = twilioAccountSid.value();
        const authToken = twilioAuthToken.value();
        const url = `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const twilioApprovalData = await response.json();

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
          userId: request.auth.uid,
          templateSid,
        });

        return {
          success: true,
          templateSid: templateSid,
          approvalData: approvalData,
        };
      } catch (error) {
        logger.error("Failed to fetch approval status", {
          userId: request.auth.uid,
          error: error instanceof Error ? error.message : "Unknown error",
          templateSid,
        });

        if (error instanceof Error && error.message.includes("not found")) {
          throw new HttpsError("not-found", "Template not found");
        }

        throw new HttpsError("internal", "Failed to fetch approval status");
      }
    }
  );
