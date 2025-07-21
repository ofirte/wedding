import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message";
import { ContentInstance } from "twilio/lib/rest/content/v2/content";

// Use Twilio's ContentInstance as the base type for ContentInsights
export type ContentInsight = ContentInstance;

export interface MessageTemplatesResponse {
  templates: ContentInsight[];
  length: number;
}
// Use Twilio's official types for creating content
// Based on Twilio's ContentListInstance.create() method signature
export interface CreateContentRequest {
  friendlyName: string;
  language: string;
  variables?: Record<string, string>;
  types?: {
    "twilio/media": {
      body: string;
      media?: string[];
    };
  };
}

export type CreateContentResponse = ContentInstance;

// Webhook payload types
export interface WebhookMessageStatusPayload {
  MessageStatus: MessageStatus;
  MessageSid: string;
  AccountSid: string;
}
