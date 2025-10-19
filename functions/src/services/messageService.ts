import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { SendMessageRequest, SendMessageResponse } from "@wedding-plan/types";
import { twilioWhatsAppFrom } from "../common/config";
import { initializeTwilioClient } from "../common/twilioUtils";
import { getFunctionBaseUrl } from "../common/utils";
import { SentMessageModel } from "../models";

export class MessageService {
  private twilioClient: any;
  private sentMessagesModel: SentMessageModel;

  constructor() {
    this.twilioClient = initializeTwilioClient();
    this.sentMessagesModel = new SentMessageModel();
  }

  private getWebhookUrl(weddingId: string): string {
    return `${getFunctionBaseUrl()}/messageStatusWebhook?weddingId=${weddingId}`;
  }

  /**
   * Send WhatsApp message using Twilio Content API
   */
  async sendWhatsAppMessage({
    contentSid,
    contentVariables,
    weddingId,
    to,
  }: SendMessageRequest): Promise<SendMessageResponse> {
    const twilioPhone = twilioWhatsAppFrom.value();

    const message = await this.twilioClient.messages.create({
      from: twilioPhone,
      contentSid,
      contentVariables: contentVariables
        ? JSON.stringify(contentVariables)
        : undefined,
      to,
      statusCallback: this.getWebhookUrl(weddingId!),
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
  }

  /**
   * Send SMS message (converts template to plain text)
   */
  async sendSmsMessage({
    to,
    contentSid,
    contentVariables,
  }: SendMessageRequest): Promise<SendMessageResponse> {
    logger.info("Converting template and sending SMS", {
      to: to,
      contentSid: contentSid,
    });

    // Get template and convert to SMS text
    const contentList = await this.twilioClient.content.v2.contents.list();
    const template = contentList.find(
      (content: any) => content.sid === contentSid
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

    const message = await this.twilioClient.messages.create({
      from: "weddingPlan",
      to: cleanPhoneNumber,
      body: smsText,
    });

    logger.info("SMS sent successfully", {
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
  }

  /**
   * Process message status webhook
   */
  async processMessageStatusWebhook(webhookData: {
    weddingId: string;
    MessageSid: string;
    MessageStatus: string;
    ErrorCode?: string;
    ErrorMessage?: string;
  }): Promise<void> {
    const { weddingId, MessageSid, MessageStatus, ErrorCode, ErrorMessage } =
      webhookData;

    const sentMessages = await this.sentMessagesModel.getByFilter(
      [{ field: "sid", operator: "==", value: MessageSid }],
      weddingId
    );
    if (!sentMessages || sentMessages.length === 0) {
      logger.warn("Message not found in sentMessages collection", {
        messageSid: MessageSid,
        weddingId,
      });
      throw new Error("Message not found");
    }

    const sentMessage = sentMessages[0];
    const updateData: any = {
      status: MessageStatus,
      dateUpdated: new Date().toISOString(),
      ...(ErrorCode
        ? {
            errorCode: parseInt(ErrorCode),
          }
        : {}),
      ...(ErrorMessage
        ? {
            errorMessage: ErrorMessage,
          }
        : {}),
    };

    await this.sentMessagesModel.update(sentMessage.id, updateData);

    logger.info("Successfully updated message status", {
      messageId: sentMessage.id,
      messageSid: MessageSid,
      newStatus: MessageStatus,
      weddingId,
      errorCode: ErrorCode || null,
    });
  }
}
