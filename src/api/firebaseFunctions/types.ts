/**
 * Enum for User Roles-related Firebase Functions
 */
export enum UserRolesFunctions {
  INITIALIZE_NEW_USER = "initializeNewUser",
  SET_USER_ROLE = "setUserRole",
  SET_GLOBAL_ADMIN = "setGlobalAdmin",
  GET_USER_CUSTOM_CLAIMS = "getUserCustomClaims",
  SET_USER_CUSTOM_CLAIMS = "setUserCustomClaims",
  REMOVE_USER_CUSTOM_CLAIMS = "removeUserCustomClaims",
  FIND_USER_BY_EMAIL = "findUserByEmail",
}

/**
 * Enum for Messaging-related Firebase Functions
 */
export enum MessagingFunctions {
  SEND_WHATSAPP_MESSAGE = "sendWhatsAppMessage",
  SEND_SMS_MESSAGE = "sendSmsMessage",
  GET_MESSAGE_STATUS = "getMessageStatus",
}

/**
 * Enum for Template-related Firebase Functions
 */
export enum TemplateFunctions {
  GET_MESSAGE_TEMPLATES = "getMessageTemplates",
  CREATE_MESSAGE_TEMPLATE = "createMessageTemplate",
  DELETE_MESSAGE_TEMPLATE = "deleteMessageTemplate",
  SUBMIT_TEMPLATE_APPROVAL = "submitTemplateApproval",
  GET_TEMPLATE_APPROVAL_STATUS = "getTemplateApprovalStatus",
}

/**
 * All Firebase Functions combined
 */
export const AllFunctions = {
  ...UserRolesFunctions,
  ...MessagingFunctions,
  ...TemplateFunctions,
} as const;

/**
 * Type for all function names
 */
export type FunctionName =
  | UserRolesFunctions
  | MessagingFunctions
  | TemplateFunctions;
