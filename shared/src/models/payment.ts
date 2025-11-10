/**
 * Payment Model Types
 * Payment-related entity models shared between frontend and backend
 */

import { WeddingPlan } from "./wedding";

export interface Payment {
  id: string;
  weddingId: string;
  userId: string;
  orderId: string;
  guestCount: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  allpayTransactionId?: string;
  cardMask?: string;
  cardType?: string;
  installments?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  receiptUrl?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}


// Extended wedding interface for payments (optional - can be merged into main Wedding interface later)
export interface WeddingPaymentInfo {
  plan: WeddingPlan;
  planActivatedAt?: string;
  paidGuestCount?: number;
}
