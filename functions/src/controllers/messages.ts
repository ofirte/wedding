import { onCall, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { twilioFunctionConfig } from "../common/config";
import { SendMessageRequest, SendMessageResponse } from "@wedding-plan/types";
import {
  getValidatedData,
  handleFunctionError,
  isAuthenticated,
} from "../common/utils";
import { MessageService } from "../services/messageService";

export const sendWhatsAppMessage = onCall<SendMessageRequest>(
  twilioFunctionConfig,
  async (request): Promise<SendMessageResponse> => {
    isAuthenticated(request);
    const { to, contentSid, contentVariables, weddingId } = getValidatedData(
      request.data,
      ["to", "contentSid", "contentVariables", "weddingId"]
    );

    try {
      logger.info("Sending WhatsApp message", {
        userId: request.auth.uid,
        to: to,
        contentSid: contentSid,
      });

      const messageService = new MessageService();
      return messageService.sendWhatsAppMessage({
        to,
        contentSid,
        contentVariables,
        weddingId,
      });
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

    try {
      logger.info("Converting template and sending SMS", {
        userId: request.auth.uid,
        to: to,
        contentSid: contentSid,
      });

      const messageService = new MessageService();
      const result = await messageService.sendSmsMessage({
        to,
        contentSid,
        contentVariables,
      });

      logger.info("SMS sent successfully", {
        userId: request.auth.uid,
        messageSid: result.messageSid,
        status: result.status,
      });

      return result;
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
    // Log the incoming webhook data
    logger.info("Received message status webhook", {
      params: req.params,
      body: req.body,
      query: req.query,
      method: req.method,
      headers: req.headers,
    });

    const { weddingId, MessageSid, MessageStatus, ErrorCode, ErrorMessage } =
      getValidatedData(
        {
          weddingId: req.query.weddingId,
          ...req.body,
        },
        ["weddingId", "MessageSid", "MessageStatus"],
        ["ErrorCode", "ErrorMessage"]
      );

    const messageService = new MessageService();
    await messageService.processMessageStatusWebhook({
      weddingId,
      MessageSid,
      MessageStatus,
      ErrorCode,
      ErrorMessage,
    });

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    logger.error("Error processing message status webhook", {
      error: error instanceof Error ? error.message : String(error),
      body: req.body,
      query: req.query,
    });

    if (error instanceof Error && error.message === "Message not found") {
      res.status(404).send("Message not found");
    } else {
      res.status(500).send("Internal server error");
    }
  }
});
