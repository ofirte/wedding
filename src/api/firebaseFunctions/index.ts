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

// Export template functions
export * from "./templates";

// Convenience re-exports for commonly used items
export {
  UserRolesFunctions,
  MessagingFunctions,
  TemplateFunctions,
  AllFunctions,
  type FunctionName,
} from "./types";

// Export organized function collections
export { userRolesFunctions } from "./userRoles";
export { messagingFunctions } from "./messaging";
export { templateFunctions } from "./templates";
