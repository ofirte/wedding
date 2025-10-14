import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import {
  twilioWhatsAppFrom,
  twilioFunctionConfig,
} from "../common/config";
import {
  SendMessageRequest,
  SendMessageResponse,
  GetMessageStatusRequest,
  GetMessageStatusResponse,
} from "../shared";
import {
  getValidatedData,
  handleFunctionError,
  isAuthenticated,
} from "../common/utils";
import { initializeTwilioClient } from "../common/twilioUtils";

/**
 * Send WhatsApp message using Twilio Content API
 */
export const sendWhatsAppMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    isAuthenticated(request);
    const { to, contentSid, contentVariables } = getValidatedData(
      request.data,
      ["to", "contentSid", "contentVariables"]
    );
    const twilioClient = initializeTwilioClient();
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
      handleFunctionError(
        error,
        { userId: request.auth.uid, to, contentSid, contentVariables },
        "Failed to send WhatsApp message"
      );
    }
  }
);

/**
 * Send SMS message (converts template to plain text)
 */
export const sendSmsMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    isAuthenticated(request);
    const { to, contentSid, contentVariables } = getValidatedData(
      request.data,
      ["to", "contentSid", "contentVariables"]
    );
    const twilioClient = initializeTwilioClient();

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
      handleFunctionError(
        error,
        { userId: request.auth.uid, to, contentSid, contentVariables },
        "Failed to send SMS message"
      );
    }
  }
);

/**
 * Get message status from Twilio
 */
export const getMessageStatus = onCall<GetMessageStatusRequest>(
  twilioFunctionConfig,
  async (request): Promise<GetMessageStatusResponse> => {
    isAuthenticated(request);
    const { messageSid } = getValidatedData(request.data, ["messageSid"]);
    const twilioClient = initializeTwilioClient();
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
      handleFunctionError(
        error,
        { userId: request.auth.uid, messageSid },
        "Failed to fetch message status"
      );
    }
  }
);
