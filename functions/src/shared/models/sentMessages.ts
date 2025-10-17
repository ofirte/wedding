/**
 * Sent Messages Model Types
 * Message logging-related entity models shared between frontend and backend
 */

import { MessageInfo } from "../api/messaging";

// Sent message model (extends MessageInfo from API)
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

// Request interface for sending messages (API layer)
export interface SendMessageApiRequest {
  to: string;
  contentSid: string;
  contentVariables?: Record<string, any>;
  weddingId?: string;
  userId?: string;
}
