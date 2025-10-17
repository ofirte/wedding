import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { twilioWhatsAppFrom, twilioFunctionConfig } from "../common/config";
import {
  SendMessageRequest,
  SendMessageResponse,
} from "../shared";
import {
  getFunctionBaseUrl,
  getValidatedData,
  handleFunctionError,
  isAuthenticated,
} from "../common/utils";
import { initializeTwilioClient } from "../common/twilioUtils";
import { initializeFirebaseAdmin } from "../common/firebaseAdmin";
import * as admin from "firebase-admin";

/**
 * Send WhatsApp message using Twilio Content API
 */

const getWebhookUrl = (weddingId: string) => {
  return `${getFunctionBaseUrl()}/messageStatusWebhook?weddingId=${weddingId}`;
};
export const sendWhatsAppMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    isAuthenticated(request);
    const { to, contentSid, contentVariables, weddingId } = getValidatedData(
      request.data,
      ["to", "contentSid", "contentVariables", "weddingId"]
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
        statusCallback: getWebhookUrl(weddingId),
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

export const messageStatusWebhook = onRequest(async (req, res) => {
  try {
    // Initialize Firebase Admin if not already initialized
    // Log the incoming webhook data
    logger.info("Received message status webhook", {
      params: req.params,
      body: req.body,
      query: req.query,
      method: req.method,
      headers: req.headers,
    });
    initializeFirebaseAdmin();

    const { weddingId, MessageSid, MessageStatus, ErrorCode, ErrorMessage } = getValidatedData(
      {
        weddingId: req.query.weddingId,
        ...req.body,
      },
      ["weddingId", "MessageSid", "MessageStatus"],
      ["ErrorCode", "ErrorMessage"]
    );

    // Update message status in Firestore
    const db = admin.firestore();
    const sentMessagesRef = db
      .collection("weddings")
      .doc(weddingId)
      .collection("sentMessages");

    // Find the message by Twilio SID
    const querySnapshot = await sentMessagesRef
      .where("sid", "==", MessageSid)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      logger.warn("Message not found in sentMessages collection", {
        messageSid: MessageSid,
        weddingId,
      });
      res.status(404).send("Message not found");
      return;
    }

    // Update the message status
    const messageDoc = querySnapshot.docs[0];
    const updateData: any = {
      status: MessageStatus,
      dateUpdated: new Date().toISOString(),
    };

    // Add error information if status indicates failure
    if (ErrorCode) {
      updateData.errorCode = parseInt(ErrorCode);
    }
    if (ErrorMessage) {
      updateData.errorMessage = ErrorMessage;
    }

    await messageDoc.ref.update(updateData);

    logger.info("Successfully updated message status", {
      messageId: messageDoc.id,
      messageSid: MessageSid,
      newStatus: MessageStatus,
      weddingId,
      errorCode: ErrorCode || null,
    });

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    logger.error("Error processing message status webhook", {
      error: error instanceof Error ? error.message : String(error),
      body: req.body,
      query: req.query,
    });

    res.status(500).send("Internal server error");
  }
});
