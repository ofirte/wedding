/**
 * Payment Model
 * Data access layer for payment operations (subcollection under weddings)
 */

import { Payment } from "@wedding-plan/types";
import { BaseModel } from "./baseModel/BaseModel";

export class PaymentModel extends BaseModel<Payment> {
  constructor(weddingId: string) {
    super(`weddings/${weddingId}/payments`, false);
  }

  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payments = await this.getByFilter([
      { field: "orderId", operator: "==", value: orderId },
    ]);

    return payments.length > 0 ? payments[0] : null;
  }

  /**
   * Find all payments for a user
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    return this.getByFilter([{ field: "userId", operator: "==", value: userId }]);
  }

  /**
   * Find completed payments for a wedding
   */
  async findCompleted(): Promise<Payment[]> {
    return this.getByFilter([
      { field: "status", operator: "==", value: "completed" },
    ]);
  }
}
