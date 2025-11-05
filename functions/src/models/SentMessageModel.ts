/**
 * Sent Messages Model
 * Data access layer for sent messages operations (wedding-scoped collection)
 */

import { SentMessage } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class SentMessageModel extends BaseModel<SentMessage> {
  constructor() {
    super("sentMessages", true); // Wedding-scoped collection
  }
}
