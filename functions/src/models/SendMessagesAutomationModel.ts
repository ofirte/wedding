/**
 * Send Messages Automation Model
 * Data access layer for automation operations (wedding-scoped collection)
 */

import { SendMessagesAutomation } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class SendMessagesAutomationModel extends BaseModel<SendMessagesAutomation> {
  constructor() {
    super("sendMessagesAutomation", true); // Wedding-scoped collection
  }
}
