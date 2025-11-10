import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { PaymentFunctions } from "./types";
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
} from "@wedding-plan/types";

/**
 * Payment-related Firebase Functions
 */
export const paymentFunctions = {
  [PaymentFunctions.CREATE_PAYMENT]: httpsCallable<
    CreatePaymentRequest,
    CreatePaymentResponse
  >(functions, PaymentFunctions.CREATE_PAYMENT),
  [PaymentFunctions.GET_PAYMENT_STATUS]: httpsCallable<
    GetPaymentStatusRequest,
    GetPaymentStatusResponse
  >(functions, PaymentFunctions.GET_PAYMENT_STATUS),
} as const;

// Export individual functions for convenience
export const createPayment =
  paymentFunctions[PaymentFunctions.CREATE_PAYMENT];
export const getPaymentStatus =
  paymentFunctions[PaymentFunctions.GET_PAYMENT_STATUS];

// Export the enum for external use
export { PaymentFunctions };
