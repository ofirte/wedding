/**
 * Enum for User Roles-related Firebase Functions
 */
export enum UserRolesFunctions {
  INITIALIZE_NEW_USER = "initializeNewUser",
  SET_USER_ROLE = "setUserRole",
  LIST_USERS = "listUsers",
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

export enum UsersFunctions {
  DELETE_USER_AUTH = "deleteUserAuth",
}

export enum SendAutomationsFunctions {
  MANUAL_RUN_MESSAGES_AUTOMATION = "manualRunMessagesAutomation",
  MANUAL_UPDATE_AUTOMATION_STATUSES = "manualUpdateAutomationStatuses",
}

/**
 * Enum for Invitation-related Firebase Functions
 */
export enum InvitationsFunctions {
  SEND_PRODUCER_INVITATION = "sendProducerInvitation",
  VALIDATE_INVITATION_TOKEN = "validateInvitationToken",
  USE_INVITATION_TOKEN = "useInvitationToken",
  LIST_INVITATIONS = "listInvitations",
  RESEND_INVITATION = "resendInvitation",
  REVOKE_INVITATION = "revokeInvitation",
}

/**
 * Enum for Payment-related Firebase Functions
 */
export enum PaymentFunctions {
  CREATE_PAYMENT = "createPayment",
  GET_PAYMENT_STATUS = "getPaymentStatus",
}

/**
 * Enum for Support-related Firebase Functions
 */
export enum SupportFunctions {
  SEND_SUPPORT_CONTACT = "sendSupportContact",
}

/**
 * All Firebase Functions combined
 */
export const AllFunctions = {
  ...UserRolesFunctions,
  ...MessagingFunctions,
  ...TemplateFunctions,
  ...UsersFunctions,
  ...SendAutomationsFunctions,
  ...InvitationsFunctions,
  ...PaymentFunctions,
  ...SupportFunctions,
} as const;

/**
 * Type for all function names
 */
export type FunctionName =
  | UserRolesFunctions
  | MessagingFunctions
  | TemplateFunctions
  | UsersFunctions
  | SendAutomationsFunctions
  | InvitationsFunctions
  | PaymentFunctions
  | SupportFunctions;
