import { ContentInstance } from "twilio/lib/rest/content/v2/content";

export interface SendMessageRequest {
  to: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  templateId?: string;
}

export interface SendMessageResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  dateCreated: string;
  dateSent?: string;
  errorMessage?: string;
}

// Types for Twilio Content Templates
export type ContentInsight = ContentInstance;

export interface MessageTemplatesResponse {
  templates: ContentInsight[];
  length: number;
}

const getBaseUrl = (): string => {
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (isDevelopment) {
    return "http://127.0.0.1:5001/wedding-c89a1/us-central1/app";
  } else {
    return "https://app-fhntq3wlyq-uc.a.run.app";
  }
};

const BASE_URL = getBaseUrl();

export const sendMessage = async (
  messageData: SendMessageRequest,
  weddingId?: string
): Promise<SendMessageResponse> => {
  console.log(BASE_URL);
  try {
    const sendMessageFunction = await fetch(
      `${BASE_URL}/messages/send-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      }
    );

    if (!sendMessageFunction.ok) {
      throw new Error(`HTTP error! status: ${sendMessageFunction.status}`);
    }

    const response = (await sendMessageFunction.json()) as SendMessageResponse;

    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const sendBulkMessages = async (
  messages: SendMessageRequest[],
  weddingId?: string
): Promise<SendMessageResponse[]> => {
  const results: SendMessageResponse[] = [];

  for (const message of messages) {
    try {
      const result = await sendMessage(message, weddingId);
      results.push(result);
    } catch (error) {
      console.error(`Error sending message to ${message.to}:`, error);
      results.push({
        sid: "",
        status: "failed",
        to: message.to,
        from: "",
        dateCreated: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
};

export const getMessageTemplates =
  async (): Promise<MessageTemplatesResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/messages/templates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as MessageTemplatesResponse;
      return data;
    } catch (error) {
      console.error("Error fetching message templates:", error);
      throw error;
    }
  };
