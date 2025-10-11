import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import twilio from "twilio";
import {
  twilioAccountSid,
  twilioAuthToken,
  twilioFunctionConfig,
} from "../shared/config";

// Helper function to initialize Twilio client
const initializeTwilioClient = () => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  return accountSid && authToken ? twilio(accountSid, authToken) : null;
};

/**
 * Get message templates from Twilio
 */
export const getMessageTemplates = onCall(
  twilioFunctionConfig,
  async (request) => {
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

      // Clean the template data to avoid circular references
      const cleanTemplates = contentList.map((template) => ({
        sid: template.sid,
        friendlyName: template.friendlyName,
        language: template.language,
        variables: template.variables,
        types: template.types,
        dateCreated: template.dateCreated?.toISOString(),
        dateUpdated: template.dateUpdated?.toISOString(),
        accountSid: template.accountSid,
      }));

      logger.info("Templates fetched successfully", {
        userId: request.auth.uid,
        count: cleanTemplates.length,
      });

      return {
        success: true,
        templates: cleanTemplates,
        count: cleanTemplates.length,
      };
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
export const createMessageTemplate = onCall(
  twilioFunctionConfig,
  async (request) => {
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

      // Clean the template data to avoid circular references
      const cleanTemplate = {
        sid: createdTemplate.sid,
        friendlyName: createdTemplate.friendlyName,
        language: createdTemplate.language,
        variables: createdTemplate.variables,
        types: createdTemplate.types,
        dateCreated: createdTemplate.dateCreated?.toISOString(),
        dateUpdated: createdTemplate.dateUpdated?.toISOString(),
        accountSid: createdTemplate.accountSid,
      };

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
export const deleteMessageTemplate = onCall(
  twilioFunctionConfig,
  async (request) => {
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
export const submitTemplateApproval = onCall(
  twilioFunctionConfig,
  async (request) => {
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

      const approvalRequest = await response.json();

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
export const getTemplateApprovalStatus = onCall(
  twilioFunctionConfig,
  async (request) => {
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

      const approvalData = await response.json();

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
