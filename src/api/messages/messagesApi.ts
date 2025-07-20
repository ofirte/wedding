import { weddingFirebase } from "../weddingFirebaseHelpers";

// Types for message-related operations
export interface MessageContent {
  id: string;
  contentSid: string;
  name: string;
  variables: string[];
  language: string;
  type: "whatsapp" | "sms";
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageTemplate {
  id: string;
  name: string;
  contentSid: string;
  variables: Record<string, string>;
  type: "whatsapp" | "sms";
  weddingId: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface MessageLog {
  id: string;
  messageSid: string;
  to: string;
  from: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  status:
    | "queued"
    | "sending"
    | "sent"
    | "failed"
    | "delivered"
    | "undelivered";
  type: "whatsapp" | "sms";
  sentAt: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  weddingId: string;
  inviteeId?: string;
  templateId?: string;
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
  console.log(BASE_URL)
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

