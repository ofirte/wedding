/**
 * Invitee Model
 * Data access layer for invitee operations (wedding-scoped collection)
 */

import { Invitee } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class InviteeModel extends BaseModel<Invitee> {
  constructor() {
    super("invitees", true); // Wedding-scoped collection
  }
}
