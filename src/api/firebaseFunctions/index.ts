/**
 * Firebase Functions - Organized by Category
 *
 * This module provides organized access to all Firebase Functions
 * with TypeScript enums for function names and categorized exports.
 */

// Export all types and enums
export * from "./types";

// Export auth functions
export * from "./userRoles";

// Export messaging functions
export * from "./messaging";

// Export send automations functions
export * from "./sendAutomations";

// Export template functions
export * from "./templates";

// Export invitation functions
export * from "./invitations";

// Export support functions
export * from "./support";

// Convenience re-exports for commonly used items
export {
  UserRolesFunctions,
  MessagingFunctions,
  SendAutomationsFunctions,
  TemplateFunctions,
  InvitationsFunctions,
  SupportFunctions,
  AllFunctions,
  type FunctionName,
} from "./types";

// Export organized function collections
export { userRolesFunctions } from "./userRoles";
export { messagingFunctions } from "./messaging";
export { sendAutomationsFunctions } from "./sendAutomations";
export { templateFunctions } from "./templates";
export { invitationsFunctions } from "./invitations";
export { supportFunctions } from "./support";
