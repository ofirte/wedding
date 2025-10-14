/**
 * Template Firebase Functions Types
 */

import { BaseResponse, ErrorResponse } from "./types";

// Core template content types
export interface TemplateContentTypes {
  "twilio/text"?: {
    body: string;
  };
  "twilio/media"?: {
    body: string;
    media: string[];
  };
}

// Core template data structure (our canonical template representation)
export interface Template {
  sid: string;
  friendlyName: string;
  language: string;
  variables?: Record<string, string>;
  types: TemplateContentTypes;
  dateCreated: string;
  dateUpdated: string;
  accountSid: string;
}

// Template document as stored in Firebase (extends Template with metadata)
export interface TemplateDocument extends Template {
  id: string;
  createdBy?: string; // Firebase user ID who created the template
  approvalStatus?: TemplateApprovalStatus;
}

// Template approval status enum
export type TemplateApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "submitted"
  | "received";

// Template approval request/response data
export interface TemplateApprovalRequest {
  name: string;
  category: string;
}

export interface TemplateApprovalResponse {
  category: string;
  status: TemplateApprovalStatus;
  rejection_reason?: string;
  name: string;
  content_type: string;
}

export interface TemplateApprovalStatusData {
  url: string;
  whatsapp?: TemplateApprovalResponse;
  account_sid: string;
  sid: string;
}

// Wedding template data (combination of templates with metadata)
export interface WeddingTemplateData {
  templates: Array<TemplateDocument>;
  length: number;
}

// Get Message Templates - No request body needed
export interface GetMessageTemplatesRequest {}

export interface GetMessageTemplatesResponse extends BaseResponse {
  success: true;
  templates: Template[];
  count: number;
}

// Create Message Template
export interface CreateMessageTemplateRequest {
  friendly_name: string;
  language: string;
  variables?: Record<string, string>;
  types: TemplateContentTypes;
}

export interface CreateMessageTemplateResponse extends BaseResponse {
  success: true;
  template: Template;
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
  approvalRequest: TemplateApprovalResponse;
}

// Get Template Approval Status
export interface GetTemplateApprovalStatusRequest {
  templateSid: string;
}

export interface GetTemplateApprovalStatusResponse extends BaseResponse {
  success: true;
  templateSid: string;
  approvalData: TemplateApprovalStatusData;
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
