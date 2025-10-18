import {
  SendMessageRequest,
  SendMessageResponse,
} from "@wedding-plan/types";
import { twilioWhatsAppFrom } from "src/common/config";
import { initializeTwilioClient } from "src/common/twilioUtils";
import { getFunctionBaseUrl } from "src/common/utils";

const getWebhookUrl = (weddingId: string) => {
  return `${getFunctionBaseUrl()}/messageStatusWebhook?weddingId=${weddingId}`;
};

export const sendWhatsAppMessageLogic = async ({
  contentSid,
  contentVariables,
  weddingId,
  to,
}: SendMessageRequest): Promise<SendMessageResponse> => {
  const twilioClient = initializeTwilioClient();
  const twilioPhone = twilioWhatsAppFrom.value();

  const message = await twilioClient.messages.create({
    from: twilioPhone,
    contentSid,
    contentVariables: contentVariables
      ? JSON.stringify(contentVariables)
      : undefined,
    to,
    statusCallback: getWebhookUrl(weddingId!),
  });

  return {
    success: true,
    messageSid: message.sid,
    status: message.status,
    from: message.from,
    to: message.to,
    dateCreated: message.dateCreated?.toISOString() || new Date().toISOString(),
  } as SendMessageResponse;
};
