import { TemplatesCategories } from "../models";
import { RSVPQuestion, SelectedTemplate } from "../models/rsvpConfig";

// Request types for API
export interface CreateCustomQuestionRequest {
  question: Omit<RSVPQuestion, "id" | "isCustom">;
}

export interface UpdateRSVPConfigRequest {
  weddingId: string;
  enabledQuestionIds: string[];
  customQuestions: RSVPQuestion[];
  selectedTemplates: Record<string, SelectedTemplate>;
}

export interface UpdateSelectedTemplatesRequest {
  weddingId: string;
  selectedTemplates: Record<TemplatesCategories, SelectedTemplate>;
}
