/**
 * Messaging Firebase Functions API Types
 */

import { BaseResponse, ErrorResponse } from "./base";
import { MessageInfo } from "../models/sentMessages";
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

// Union types for all messaging functions
export type MessagingFunctionRequest =
  | SendMessageRequest
  | GetMessageStatusRequest;

export type MessagingFunctionResponse =
  | SendMessageResponse
  | GetMessageStatusResponse
  | ErrorResponse;
