import { createCollectionAPI } from "../weddingFirebaseHelpers";
import {
  sendWhatsAppMessage,
  sendSmsMessage,
  getMessageStatus,
} from "../firebaseFunctions";
import {
  GetMessageStatusResponse,
  MessageInfo,
  SendMessageRequest,
} from "../../../shared";

// SMS-specific request interface (same as WhatsApp)
export interface SendMessageApiRequest extends SendMessageRequest {
  userId?: string;
}

// Types for Firebase sent messages collection
export interface SentMessage extends MessageInfo {
  id: string;
  contentSid: string;
  contentVariables: Record<string, string>;
  templateId: string;
  userId: string; // Firebase user ID who sent the message
  messageType: "whatsapp" | "sms" | "personal-whatsapp"; // Track message type
  dateCreated: string;
  dateUpdated: string;
}

// Create collection API for sent messages
const sentMessagesAPI = createCollectionAPI<SentMessage>("sentMessages");

// Export the standard CRUD operations for sent messages
export const fetchSentMessages = sentMessagesAPI.fetchAll;
export const subscribeToSentMessages = sentMessagesAPI.subscribe;
export const fetchSentMessage = sentMessagesAPI.fetchById;
export const updateSentMessage = sentMessagesAPI.update;
export const deleteSentMessage = sentMessagesAPI.delete;
export const bulkUpdateSentMessages = sentMessagesAPI.bulkUpdate;
export const bulkDeleteSentMessages = sentMessagesAPI.bulkDelete;
export const fetchSentMessagesByFilter = sentMessagesAPI.fetchByFilter;

export const sendMessage = async (
  messageData: SendMessageApiRequest,
  weddingId?: string
): Promise<SentMessage> => {
  try {
    // Call Firebase callable function
    const result = await sendWhatsAppMessage({
      to: messageData.to,
      contentSid: messageData.contentSid,
      contentVariables: messageData.contentVariables,
    });

    // Transform the response to match expected format
    const responseData = result.data;
    const sentMessage: Omit<SentMessage, "id"> = {
      sid: responseData.messageSid,
      status: responseData.status,
      to: responseData.to,
      from: responseData.from,
      dateCreated: responseData.dateCreated,
      dateUpdated: responseData.dateCreated,
      contentSid: messageData.contentSid,
      contentVariables: messageData.contentVariables || {},
      templateId: messageData.contentSid || "",
      userId: messageData.userId || "",
      messageType: "whatsapp",
    };

    const sentMessageId = await saveSentMessage(sentMessage, weddingId);

    return { ...sentMessage, id: sentMessageId };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Send SMS message using WhatsApp template content
 */
export const sendSMSMessage = async (
  messageData: SendMessageApiRequest,
  weddingId?: string
): Promise<SentMessage> => {
  try {
    // Call Firebase callable function
    const result = await sendSmsMessage({
      to: messageData.to,
      contentSid: messageData.contentSid,
      contentVariables: messageData.contentVariables,
    });

    const responseData = result.data as any;

    const sentMessage: Omit<SentMessage, "id"> = {
      sid: responseData.messageSid,
      status: responseData.status,
      to: responseData.to,
      from: responseData.from,
      dateCreated: responseData.dateCreated,
      dateUpdated: responseData.dateCreated,
      contentSid: messageData.contentSid,
      contentVariables: messageData.contentVariables || {},
      templateId: messageData.contentSid || "",
      userId: messageData.userId || "",
      messageType: "sms",
    };

    const sentMessageId = await saveSentMessage(sentMessage, weddingId);

    return { ...sentMessage, id: sentMessageId };
  } catch (error) {
    console.error("Error sending SMS message:", error);
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
): Promise<GetMessageStatusResponse> => {
  try {
    const result = await getMessageStatus({
      messageSid: messageSid,
    });

    return result.data;
  } catch (error) {
    console.error("Error fetching message status from Twilio:", error);
    throw error;
  }
};

// Firebase Firestore functions for sent messages

/**
 * Save a sent message to Firebase
 */
export const saveSentMessage = async (
  sentMessage: Omit<SentMessage, "id">,
  weddingId?: string
): Promise<string> => {
  try {
    const docRef = await sentMessagesAPI.create(sentMessage, weddingId);
    return docRef.id;
  } catch (error) {
    console.error("Error saving sent message to Firebase:", error);
    throw error;
  }
};

/**
 * Save a personal WhatsApp message (manually sent via personal WhatsApp)
 */
export const savePersonalWhatsAppMessage = async (
  contentSid: string,
  contentVariables: Record<string, any>,
  userId: string,
  phoneNumber: string,
  weddingId?: string
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const sentMessage: Omit<SentMessage, "id"> = {
      sid: `personal-wa-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`, // Generate unique ID
      to: phoneNumber,
      from: "personal-whatsapp", // Indicate this was sent via personal WhatsApp
      status: "delivered", // Assume delivered since it's manual
      contentSid,
      contentVariables,
      templateId: contentSid, // Use contentSid as templateId for consistency
      dateCreated: now,
      dateUpdated: now,
      errorMessage: "",
      userId,
      messageType: "personal-whatsapp",
    };

    const docRef = await sentMessagesAPI.create(sentMessage, weddingId);
    return docRef.id;
  } catch (error) {
    console.error("Error saving personal WhatsApp message to Firebase:", error);
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
    return await sentMessagesAPI.fetchAll(weddingId);
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
    const updateData: Partial<SentMessage> = {
      status,
      dateUpdated: new Date().toISOString(),
    };

    await sentMessagesAPI.update(messageId, updateData, weddingId);

    console.log(`Updated message ${messageId} status to ${status}`);
  } catch (error) {
    console.error("Error updating message status in Firebase:", error);
    throw error;
  }
};
