/**
 * Messaging Firebase Functions Types
 */

import { BaseResponse, ErrorResponse } from "./types";

// Send WhatsApp Message
export interface SendWhatsAppMessageRequest {
  to: string;
  contentSid: string;
  contentVariables?: Record<string, any>;
}

export interface SendWhatsAppMessageResponse extends BaseResponse {
  success: true;
  messageSid: string;
  status: string;
  from: string;
  to: string;
  dateCreated: string;
}

// Send SMS Message
export interface SendSmsMessageRequest {
  to: string;
  contentSid: string;
  contentVariables?: Record<string, any>;
}

export interface SendSmsMessageResponse extends BaseResponse {
  success: true;
  messageSid: string;
  status: string;
  from: string;
  to: string;
  dateCreated: string;
  messageType: "sms";
}

// Get Message Status
export interface GetMessageStatusRequest {
  messageSid: string;
}

export interface GetMessageStatusResponse extends BaseResponse {
  success: true;
  messageInfo: {
    sid: string;
    status: string;
    from: string;
    to: string;
    dateCreated?: string;
    dateUpdated?: string;
    errorCode?: number;
    errorMessage?: string;
  };
}

// Union types for all messaging functions
export type MessagingFunctionRequest =
  | SendWhatsAppMessageRequest
  | SendSmsMessageRequest
  | GetMessageStatusRequest;

export type MessagingFunctionResponse =
  | SendWhatsAppMessageResponse
  | SendSmsMessageResponse
  | GetMessageStatusResponse
  | ErrorResponse;
