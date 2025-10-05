import { ContentInstance } from "twilio/lib/rest/content/v2/content";
import { weddingFirebase } from "../weddingFirebaseHelpers";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

export interface SendMessageRequest {
  to: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  templateId?: string;
  userId?: string; // Optional user ID for tracking
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

// Twilio message status response from API
export interface TwilioMessageStatus {
  messageInfo: MessageInstance;
}

// Types for Firebase sent messages collection
export interface SentMessage {
  id: string;
  sid: string; // Twilio message SID
  to: string;
  from: string;
  status: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  templateId?: string;
  dateCreated: string;
  dateSent?: string;
  dateUpdated?: string;
  errorMessage?: string;
  weddingId: string;
  userId?: string;
}

const getBaseUrl = (): string => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const isProduction = process.env.NODE_ENV === "production";
  if (isLocal) {
    return "http://127.0.0.1:5001/wedding-c89a1/us-central1/app";
  }
  if (isProduction) {
    return "https://app-ga5vulihbq-uc.a.run.app";
  }
  if (isDevelopment) {
    return "https://app-fhntq3wlyq-uc.a.run.app";
  }
  return "http://127.0.0.1:5001/wedding-c89a1/us-central1/app";
};

const BASE_URL = getBaseUrl();

export const sendMessage = async (
  messageData: SendMessageRequest,
  weddingId?: string
): Promise<SendMessageResponse> => {
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

    await saveSentMessage(messageData, response, weddingId);

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
      const failedResult: SendMessageResponse = {
        sid: "",
        status: "failed",
        to: message.to,
        from: "",
        dateCreated: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
      results.push(failedResult);

      // Save failed message to Firebase for tracking
      try {
        await saveSentMessage(message, failedResult, weddingId);
      } catch (saveError) {
        console.error(
          "Error saving failed bulk message to Firebase:",
          saveError
        );
      }
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

/**
 * Check message status from Twilio API
 * @param messageSid The Twilio message SID to check
 * @returns Promise resolving to Twilio message status
 */
export const checkMessageStatus = async (
  messageSid: string
): Promise<TwilioMessageStatus> => {
  try {
    const response = await fetch(`${BASE_URL}/messages/status/${messageSid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Message with SID ${messageSid} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as TwilioMessageStatus;
    return data;
  } catch (error) {
    console.error("Error checking message status:", error);
    throw error;
  }
};

// Firebase Firestore functions for sent messages

/**
 * Save a sent message to Firebase
 */
export const saveSentMessage = async (
  messageRequest: SendMessageRequest,
  messageResponse: SendMessageResponse,
  weddingId?: string
): Promise<string> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    const sentMessage: Omit<SentMessage, "id"> = {
      sid: messageResponse.sid || "",
      to: messageResponse.to || "",
      from: messageResponse.from || "",
      status: messageResponse.status || "unknown",
      contentSid: messageRequest.contentSid || "",
      contentVariables: messageRequest.contentVariables || {},
      templateId: messageRequest.templateId || "",
      dateCreated: messageResponse.dateCreated || new Date().toISOString(),
      dateSent: messageResponse.dateSent || new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      errorMessage: messageResponse.errorMessage ?? "",
      weddingId: resolvedWeddingId,
      userId: messageRequest.userId || "", // Optional user ID for tracking
    };

    const docRef = await weddingFirebase.addDocument(
      "sentMessages",
      sentMessage,
      resolvedWeddingId
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving sent message to Firebase:", error);
    throw error;
  }
};

/**
 * Get all sent messages for a wedding
 */
export const getSentMessages = async (
  weddingId?: string
): Promise<SentMessage[]> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    // This would typically use a query to get all documents
    // For now, we'll use the listener pattern which is already implemented
    return new Promise((resolve, reject) => {
      weddingFirebase.listenToCollection<SentMessage>(
        "sentMessages",
        (messages) => resolve(messages),
        (error) => reject(error),
        resolvedWeddingId
      );
    });
  } catch (error) {
    console.error("Error getting sent messages from Firebase:", error);
    throw error;
  }
};

/**
 * Update message status in Firebase
 * @param messageId The Firebase document ID of the message
 * @param status The new status to set
 * @param additionalData Optional additional data to update (dateSent, errorMessage, etc.)
 * @param weddingId Optional wedding ID
 */
export const updateMessageStatus = async (
  messageId: string,
  status: string,
  weddingId?: string
): Promise<void> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    const updateData: Partial<SentMessage> = {
      status,
      dateUpdated: new Date().toISOString(),
    };

    await weddingFirebase.updateDocument(
      "sentMessages",
      messageId,
      updateData,
      resolvedWeddingId
    );

    console.log(`Updated message ${messageId} status to ${status}`);
  } catch (error) {
    console.error("Error updating message status in Firebase:", error);
    throw error;
  }
};
