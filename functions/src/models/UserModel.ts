/**
 * User Model
 * Data access layer for user operations (top-level collection)
 */

import { WeddingUser } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";
import { ModelDocument } from "./baseModel/ModelCRUD";

// Extended WeddingUser to ensure id is always present for ModelDocument compatibility
interface WeddingUserDocument extends Omit<WeddingUser, "id">, ModelDocument {}

export class UserModel extends BaseModel<WeddingUserDocument> {
  constructor() {
    super("users", false); // Top-level collection
  }
}
