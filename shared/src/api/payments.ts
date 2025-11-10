/**
 * Payments Firebase Functions API Types
 */

import { BaseResponse, ErrorResponse } from "./base";

// Payment statuses
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// Create Payment
export interface CreatePaymentRequest {
  weddingId: string;
  guestCount: number;
}

export interface CreatePaymentResponse extends BaseResponse {
  success: true;
  paymentUrl: string;
  orderId: string;
  amount: number;
  currency: string;
}

// Get Payment Status
export interface GetPaymentStatusRequest {
  paymentId: string;
}

export interface GetPaymentStatusResponse extends BaseResponse {
  success: true;
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  completedAt?: string;
}

// AllPay Webhook Payload
// Based on actual AllPay documentation
export interface AllPayWebhookPayload {
  name: string;
  items: string; // JSON string of items array
  amount: string;
  status: number; // 1 = success, other = failure
  client_name: string;
  client_email: string;
  client_tehudat: string;
  client_phone: string;
  foreign_card: string;
  card_mask: string;
  card_brand: string; // e.g., "visa", "mastercard"
  receipt: string; // URL to receipt PDF
  sign: string; // Signature for validation
}

// Union types for all payment functions
export type PaymentsFunctionRequest =
  | CreatePaymentRequest
  | GetPaymentStatusRequest;

export type PaymentsFunctionResponse =
  | CreatePaymentResponse
  | GetPaymentStatusResponse
  | ErrorResponse;
