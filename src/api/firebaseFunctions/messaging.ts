import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { MessagingFunctions } from "./types";
import {
  GetMessageStatusRequest,
  GetMessageStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "../../../shared";

/**
 * Messaging-related Firebase Functions
 */
export const messagingFunctions = {
  [MessagingFunctions.SEND_WHATSAPP_MESSAGE]: httpsCallable<
    SendMessageRequest,
    SendMessageResponse
  >(functions, MessagingFunctions.SEND_WHATSAPP_MESSAGE),
  [MessagingFunctions.SEND_SMS_MESSAGE]: httpsCallable<
    SendMessageRequest,
    SendMessageResponse
  >(functions, MessagingFunctions.SEND_SMS_MESSAGE),
  [MessagingFunctions.GET_MESSAGE_STATUS]: httpsCallable<
    GetMessageStatusRequest,
    GetMessageStatusResponse
  >(functions, MessagingFunctions.GET_MESSAGE_STATUS),
} as const;

// Export individual functions for convenience
export const sendWhatsAppMessage =
  messagingFunctions[MessagingFunctions.SEND_WHATSAPP_MESSAGE];
export const sendSmsMessage =
  messagingFunctions[MessagingFunctions.SEND_SMS_MESSAGE];
export const getMessageStatus =
  messagingFunctions[MessagingFunctions.GET_MESSAGE_STATUS];

// Export the enum for external use
export { MessagingFunctions };
