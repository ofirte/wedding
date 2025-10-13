// Export all RSVP hooks for easier imports
export { useSendMessage } from "./useSendMessage";
export { useSendSMSMessage } from "./useSendSMSMessage";
export { usePersonalWhatsApp } from "./usePersonalWhatsApp";
export { useSendBulkMessages } from "./useSendBulkMessages";
export { useSentMessages } from "./useSentMessages";
export { useCheckMessageStatus } from "./useCheckMessageStatus";
export { useUpdateMessageStatus } from "./useUpdateMessageStatus";
export { useCreateTemplate } from "./useCreateTemplate";
export { useTemplates } from "./useTemplates";
export { useDeleteTemplate } from "./useDeleteTemplate";
export { useSubmitTemplateApproval } from "./useSubmitTemplateApproval";
export { useApprovalStatus } from "./useApprovalStatus";
export { useApprovalStatusSync } from "./useApprovalStatusSync";
// Note: RSVP status hooks have been moved to invitees hooks since data is now denormalized

// Also export types from rsvpApi for convenience
export type {
  SendMessageRequest,
  SendMessageResponse,
  SendSMSRequest,
  SendSMSResponse,
  SentMessage,
  ContentInsight,
} from "../../api/rsvp/rsvpApi";

// Export types from templateApi
export type {
  CreateTemplateRequest,
  CreateTemplateResponse,
  TemplateDocument,
  ApprovalRequest,
  ApprovalResponse,
  ApprovalStatusResponse,
} from "../../api/rsvp/templateApi";
