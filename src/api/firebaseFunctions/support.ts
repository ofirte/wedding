import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { SupportFunctions } from "./types";

/**
 * Request interface for sending support contact
 */
export interface SendSupportContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Response interface for sending support contact
 */
export interface SendSupportContactResponse {
  success: boolean;
  message: string;
}

/**
 * Support-related Firebase Functions
 */
export const supportFunctions = {
  [SupportFunctions.SEND_SUPPORT_CONTACT]: httpsCallable<
    SendSupportContactRequest,
    SendSupportContactResponse
  >(functions, SupportFunctions.SEND_SUPPORT_CONTACT),
} as const;

// Export individual function for convenience
export const sendSupportContact =
  supportFunctions[SupportFunctions.SEND_SUPPORT_CONTACT];

// Export the enum for external use
export { SupportFunctions };
