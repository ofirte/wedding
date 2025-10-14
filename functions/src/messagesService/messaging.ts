import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import twilio from "twilio";
import {
  twilioAccountSid,
  twilioAuthToken,
  twilioWhatsAppFrom,
  twilioFunctionConfig,
} from "../common/config";
import {
  SendMessageRequest,
  SendMessageResponse,
  GetMessageStatusRequest,
  GetMessageStatusResponse,
} from "../shared";

// Helper function to initialize Twilio client
const initializeTwilioClient = () => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  return accountSid && authToken ? twilio(accountSid, authToken) : null;
};

/**
 * Send WhatsApp message using Twilio Content API
 */
export const sendWhatsAppMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { to, contentSid, contentVariables } = request.data;

    if (!to || !contentSid) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: to, contentSid"
      );
    }

    const twilioClient = initializeTwilioClient();
    if (!twilioClient) {
      throw new HttpsError(
        "failed-precondition",
        "Twilio client not configured"
      );
    }

    const twilioPhone = twilioWhatsAppFrom.value();

    try {
      logger.info("Sending WhatsApp message", {
        userId: request.auth.uid,
        to: to,
        contentSid: contentSid,
      });

      const message = await twilioClient.messages.create({
        from: twilioPhone,
        contentSid,
        contentVariables: contentVariables
          ? JSON.stringify(contentVariables)
          : undefined,
        to,
      });

      logger.info("WhatsApp message sent successfully", {
        userId: request.auth.uid,
        messageSid: message.sid,
        status: message.status,
      });

      return {
        success: true,
        messageSid: message.sid,
        status: message.status,
        from: message.from,
        to: message.to,
        dateCreated:
          message.dateCreated?.toISOString() || new Date().toISOString(),
      } as SendMessageResponse;
    } catch (error) {
      logger.error("Failed to send WhatsApp message", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        to: to,
        contentSid: contentSid,
      });

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new HttpsError("not-found", "Template not found");
        }
        if (error.message.includes("invalid")) {
          throw new HttpsError(
            "invalid-argument",
            `Invalid request: ${error.message}`
          );
        }
      }

      throw new HttpsError("internal", "Failed to send message");
    }
  }
);

/**
 * Send SMS message (converts template to plain text)
 */
export const sendSmsMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { to, contentSid, contentVariables } = request.data;

    if (!to || !contentSid) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: to, contentSid"
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
      logger.info("Converting template and sending SMS", {
        userId: request.auth.uid,
        to: to,
        contentSid: contentSid,
      });

      // Get template and convert to SMS text
      const contentList = await twilioClient.content.v2.contents.list();
      const template = contentList.find(
        (content) => content.sid === contentSid
      );

      if (!template) {
        throw new HttpsError("not-found", "Template not found");
      }

      // Extract template body and replace variables
      const textType =
        template.types?.["twilio/text"] || template.types?.["whatsapp"];
      const templateBody = (textType as any)?.body;

      if (!templateBody || typeof templateBody !== "string") {
        throw new HttpsError("failed-precondition", "No template body found");
      }

      let smsText = templateBody;
      if (contentVariables) {
        Object.entries(contentVariables).forEach(([key, value]) => {
          smsText = smsText.replace(
            new RegExp(`\\{\\{${key}\\}\\}`, "g"),
            value as string
          );
        });
      }

      // Clean phone number and send SMS
      const cleanPhoneNumber = to.replace(/^whatsapp:/, "");

      const message = await twilioClient.messages.create({
        from: "weddingPlan",
        to: cleanPhoneNumber,
        body: smsText,
      });

      logger.info("SMS sent successfully", {
        userId: request.auth.uid,
        messageSid: message.sid,
        status: message.status,
      });

      return {
        success: true,
        messageSid: message.sid,
        status: message.status,
        from: message.from,
        to: message.to,
        dateCreated:
          message.dateCreated?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to send SMS", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        to: to,
        contentSid: contentSid,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to send SMS");
    }
  }
);

/**
 * Get message status from Twilio
 */
export const getMessageStatus = onCall<GetMessageStatusRequest>(
  twilioFunctionConfig,
  async (request): Promise<GetMessageStatusResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { messageSid } = request.data;

    if (!messageSid) {
      throw new HttpsError("invalid-argument", "Message SID is required");
    }

    const twilioClient = initializeTwilioClient();
    if (!twilioClient) {
      throw new HttpsError(
        "failed-precondition",
        "Twilio client not configured"
      );
    }

    try {
      logger.info("Fetching message status", {
        userId: request.auth.uid,
        messageSid,
      });

      const message = await twilioClient.messages(messageSid).fetch();

      logger.info("Message status fetched successfully", {
        userId: request.auth.uid,
        messageSid,
        status: message.status,
      });

      return {
        success: true,
        messageInfo: {
          sid: message.sid,
          status: message.status,
          from: message.from,
          to: message.to,
          dateCreated: message.dateCreated?.toISOString(),
          dateUpdated: message.dateUpdated?.toISOString(),
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
        },
      };
    } catch (error) {
      logger.error("Failed to fetch message status", {
        userId: request.auth.uid,
        error: error instanceof Error ? error.message : "Unknown error",
        messageSid,
      });

      if (error instanceof Error && error.message.includes("not found")) {
        throw new HttpsError("not-found", "Message not found");
      }

      throw new HttpsError("internal", "Failed to fetch message status");
    }
  }
);
