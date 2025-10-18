/**
 * Template Model Types
 * Template-related entity models shared between frontend and backend
 */

import { TemplateContentTypes, TemplateApprovalStatus } from "../api/templates";

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
