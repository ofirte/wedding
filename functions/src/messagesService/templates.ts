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
import {
  getValidatedData,
  handleFunctionError,
  isAuthenticated,
} from "../common/utils";
import { ContentInstance as ContentInstanceV2 } from "twilio/lib/rest/content/v2/content";
import { ContentInstance as ContentInstanceV1 } from "twilio/lib/rest/content/v1/content";

// Helper function to initialize Twilio client
const initializeTwilioClient = () => {
  try {
    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    if (!accountSid || !authToken) {
      logger.error("Twilio credentials are not set");
      throw new HttpsError(
        "failed-precondition",
        "Twilio credentials are not configured"
      );
    }
    return twilio(accountSid, authToken);
  } catch (error) {
    logger.error("Error initializing Twilio client", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new HttpsError("internal", "Failed to initialize Twilio client");
  }
};

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
 * Get message templates from Twilio
 */
export const getMessageTemplates = onCall<GetMessageTemplatesRequest>(
  twilioFunctionConfig,
  async (request): Promise<GetMessageTemplatesResponse> => {
    isAuthenticated(request);
    const twilioClient = initializeTwilioClient();

    try {
      logger.info("Fetching message templates", {
        userId: request.auth.uid,
      });

      const contentList = await twilioClient.content.v2.contents.list();
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
    isAuthenticated(request);
    const { friendly_name, language, variables, types } = getValidatedData(
      request.data,
      ["friendly_name", "language", "variables", "types"]
    );

    const twilioClient = initializeTwilioClient();

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
      const cleanTemplate = convertTwilioToTemplate(createdTemplate);

      logger.info("Template created successfully", {
        userId: request.auth.uid,
        templateSid: createdTemplate.sid,
        friendly_name,
      });

      return {
        success: true,
        template: cleanTemplate,
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
    isAuthenticated(request);
    const { templateSid } = getValidatedData(request.data, ["templateSid"]);

    const twilioClient = initializeTwilioClient();

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
    isAuthenticated(request);
    const { templateSid, name, category } = getValidatedData(request.data, [
      "templateSid",
      "name",
      "category",
    ]);
    const twilioClient = initializeTwilioClient();

    try {
      logger.info("Submitting template for approval", {
        userId: request.auth.uid,
        ...request.data,
      });

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
        userId: request.auth.uid,
        templateSid,
        approvalStatus: approvalRequest.status,
      });

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
      isAuthenticated(request);
      const { templateSid } = getValidatedData(request.data, ["templateSid"]);
      const twilioClient = initializeTwilioClient();
      try {
        logger.info("Fetching approval status", {
          userId: request.auth.uid,
          templateSid,
        });

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
          userId: request.auth.uid,
          templateSid,
        });

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
