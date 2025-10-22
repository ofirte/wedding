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

/**
 * Global Template Categories
 * Semantic categories for global templates that are available to all weddings
 */
export type GlobalTemplateCategory = "rsvp" | "notifications";

/**
 * Global Template Data Structure
 * These templates are available to all weddings in the system
 */
export interface GlobalTemplate {
  id: string;
  name: string;
  category: GlobalTemplateCategory;
  language: "en" | "he";
  messageText: string;
  variables: Record<string, string>;
  description?: string; // Optional description for the template
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
