/**
 * Template Model
 * Data access layer for template operations (wedding-scoped collection)
 */

import { TemplateDocument } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class TemplateModel extends BaseModel<TemplateDocument> {
  constructor() {
    super("templates", true); // Wedding-scoped collection
  }
}
