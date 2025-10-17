/**
 * Messaging Firebase Functions Types
 */

import { BaseResponse, ErrorResponse } from "./types";

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
export type MessagingFunctionRequest = SendMessageRequest;

export type MessagingFunctionResponse = SendMessageResponse | ErrorResponse;
