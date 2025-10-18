/**
 * Sent Messages Model Types
 * Message logging-related entity models shared between frontend and backend
 */

export interface MessageInfo {
  sid: string;
  status: string;
  from: string;
  to: string;
  dateCreated?: string;
  dateUpdated?: string;
  errorCode?: number;
  errorMessage?: string;
}
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
