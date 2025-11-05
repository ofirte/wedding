/**
 * Models Index
 * Export all model classes for easy importing
 */

// Base classes
export { BaseModel } from "./baseModel/BaseModel";
export { ModelCRUD } from "./baseModel/ModelCRUD";
export type {
  ModelDocument,
  FilterOptions,
  QueryOptions,
} from "./baseModel/ModelCRUD";

// Model classes
export { UserModel } from "./UserModel";
export { WeddingModel } from "./WeddingModel";
export { InviteeModel } from "./InviteeModel";
export { SentMessageModel } from "./SentMessageModel";
export { TemplateModel } from "./TemplateModel";
export { GlobalTemplateModel } from "./GlobalTemplateModel";
export { SendMessagesAutomationModel } from "./SendMessagesAutomationModel";
