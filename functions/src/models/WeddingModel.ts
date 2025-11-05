/**
 * Wedding Model
 * Data access layer for wedding operations (top-level collection)
 */

import { Wedding } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class WeddingModel extends BaseModel<Wedding> {
  constructor() {
    super("weddings", false); // Top-level collection
  }
}
