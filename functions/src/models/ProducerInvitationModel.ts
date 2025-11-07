/**
 * Producer Invitation Model
 * Data access layer for producer invitation operations (top-level collection)
 */

import { ProducerInvitation } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";
import { FilterOptions, ModelDocument } from "./baseModel/ModelCRUD";

// Extended ProducerInvitation to ensure id is always present for ModelDocument compatibility
interface ProducerInvitationDocument
  extends Omit<ProducerInvitation, "id">,
    ModelDocument {}

export class ProducerInvitationModel extends BaseModel<ProducerInvitationDocument> {
  constructor() {
    super("producerInvitations", false); // Top-level collection
  }

  /**
   * Find invitation by token
   */
  async getByToken(token: string): Promise<ProducerInvitationDocument | null> {
    const invitations = await this.getByFilter([
      { field: "token", operator: "==", value: token },
    ]);
    return invitations.length > 0 ? invitations[0] : null;
  }

  /**
   * Find invitations by email
   */
  async getByEmail(email: string): Promise<ProducerInvitationDocument[]> {
    return this.getByFilter([{ field: "email", operator: "==", value: email }]);
  }

  /**
   * Find pending invitations by email
   */
  async getPendingByEmail(
    email: string
  ): Promise<ProducerInvitationDocument[]> {
    return this.getByFilter([
      { field: "email", operator: "==", value: email },
      { field: "status", operator: "==", value: "pending" },
    ]);
  }

  /**
   * Get all invitations by status
   */
  async getByStatus(status: string): Promise<ProducerInvitationDocument[]> {
    return this.getByFilter([
      { field: "status", operator: "==", value: status },
    ]);
  }

  /**
   * Get all invitations ordered by creation date
   */
  async getAllOrdered(status?: string): Promise<ProducerInvitationDocument[]> {
    const filters: FilterOptions[] | undefined =
      status && status !== "all"
        ? [{ field: "status", operator: "==", value: status }]
        : undefined;
    if (filters) {
      return this.getByFilter(filters, undefined, {
        orderBy: { field: "createdAt", direction: "desc" },
      });
    } else {
      return this.getAll(undefined, {
        orderBy: { field: "createdAt", direction: "desc" },
      });
    }
  }
}
