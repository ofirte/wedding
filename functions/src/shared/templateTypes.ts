/**
 * Template Firebase Functions Types
 */

import { BaseResponse, ErrorResponse } from "./types";

// Common template types
export interface TwilioTemplate {
  sid: string;
  friendlyName?: string;
  language?: string;
  variables?: Record<string, any>;
  types?: Record<string, any>;
  dateCreated?: string;
  dateUpdated?: string;
  accountSid?: string;
}

// Get Message Templates - No request body needed
export interface GetMessageTemplatesRequest {}

export interface GetMessageTemplatesResponse extends BaseResponse {
  success: true;
  templates: TwilioTemplate[];
  count: number;
}

// Create Message Template
export interface CreateMessageTemplateRequest {
  friendly_name: string;
  language: string;
  variables?: Record<string, any>;
  types: Record<string, any>;
}

export interface CreateMessageTemplateResponse extends BaseResponse {
  success: true;
  template: TwilioTemplate;
}

// Delete Message Template
export interface DeleteMessageTemplateRequest {
  templateSid: string;
}

export interface DeleteMessageTemplateResponse extends BaseResponse {
  success: true;
  message: string;
  templateSid: string;
}

// Submit Template Approval
export interface SubmitTemplateApprovalRequest {
  templateSid: string;
  name: string;
  category: string;
}

export interface SubmitTemplateApprovalResponse extends BaseResponse {
  success: true;
  approvalRequest: any; // Twilio's approval request object
}

// Get Template Approval Status
export interface GetTemplateApprovalStatusRequest {
  templateSid: string;
}

export interface GetTemplateApprovalStatusResponse extends BaseResponse {
  success: true;
  templateSid: string;
  approvalData: any; // Twilio's approval data object
}

// Union types for all template functions
export type TemplateFunctionRequest =
  | GetMessageTemplatesRequest
  | CreateMessageTemplateRequest
  | DeleteMessageTemplateRequest
  | SubmitTemplateApprovalRequest
  | GetTemplateApprovalStatusRequest;

export type TemplateFunctionResponse =
  | GetMessageTemplatesResponse
  | CreateMessageTemplateResponse
  | DeleteMessageTemplateResponse
  | SubmitTemplateApprovalResponse
  | GetTemplateApprovalStatusResponse
  | ErrorResponse;
