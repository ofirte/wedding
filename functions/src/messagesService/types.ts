import { ContentInstance } from "twilio/lib/rest/content/v2/content";

// Use Twilio's ContentInstance as the base type for ContentInsights
export type ContentInsight = ContentInstance;

export interface MessageTemplatesResponse {
  templates: ContentInsight[];
  length: number;
}
