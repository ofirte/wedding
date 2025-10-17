/**
 * Messaging Firebase Functions API Types
 */

import { BaseResponse, ErrorResponse } from "./base";

export interface SendMessageRequest {
  to: string;
  contentSid: string;
  contentVariables?: Record<string, any>;
  weddingId?: string;
}

export interface SendMessageResponse extends BaseResponse {
  success: true;
  messageSid: string;
  status: string;
  from: string;
  to: string;
  dateCreated: string;
}

// Get Message Status
export interface GetMessageStatusRequest {
  messageSid: string;
}

export interface GetMessageStatusResponse extends BaseResponse {
  success: true;
  messageInfo: MessageInfo;
}

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

// Union types for all messaging functions
export type MessagingFunctionRequest =
  | SendMessageRequest
  | GetMessageStatusRequest;

export type MessagingFunctionResponse =
  | SendMessageResponse
  | GetMessageStatusResponse
  | ErrorResponse;
