import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { TemplateFunctions } from "./types";

/**
 * Template-related Firebase Functions
 */
export const templateFunctions = {
  [TemplateFunctions.GET_MESSAGE_TEMPLATES]: httpsCallable(
    functions,
    TemplateFunctions.GET_MESSAGE_TEMPLATES
  ),
  [TemplateFunctions.CREATE_MESSAGE_TEMPLATE]: httpsCallable(
    functions,
    TemplateFunctions.CREATE_MESSAGE_TEMPLATE
  ),
  [TemplateFunctions.DELETE_MESSAGE_TEMPLATE]: httpsCallable(
    functions,
    TemplateFunctions.DELETE_MESSAGE_TEMPLATE
  ),
  [TemplateFunctions.SUBMIT_TEMPLATE_APPROVAL]: httpsCallable(
    functions,
    TemplateFunctions.SUBMIT_TEMPLATE_APPROVAL
  ),
  [TemplateFunctions.GET_TEMPLATE_APPROVAL_STATUS]: httpsCallable(
    functions,
    TemplateFunctions.GET_TEMPLATE_APPROVAL_STATUS
  ),
} as const;

// Export individual functions for convenience
export const getMessageTemplates =
  templateFunctions[TemplateFunctions.GET_MESSAGE_TEMPLATES];
export const createMessageTemplate =
  templateFunctions[TemplateFunctions.CREATE_MESSAGE_TEMPLATE];
export const deleteMessageTemplate =
  templateFunctions[TemplateFunctions.DELETE_MESSAGE_TEMPLATE];
export const submitTemplateApproval =
  templateFunctions[TemplateFunctions.SUBMIT_TEMPLATE_APPROVAL];
export const getTemplateApprovalStatus =
  templateFunctions[TemplateFunctions.GET_TEMPLATE_APPROVAL_STATUS];

// Export the enum for external use
export { TemplateFunctions };
