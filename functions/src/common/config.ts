import { defineSecret } from "firebase-functions/params";

// Define secrets
export const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
export const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
export const twilioWhatsAppFrom = defineSecret("TWILIO_WHATSAPP_FROM");

// AllPay secrets
export const allpayApiLogin = defineSecret("ALLPAY_API_LOGIN");
export const allpayApiKey = defineSecret("ALLPAY_API_KEY");

// Function configuration for Twilio functions
export const twilioFunctionConfig = {
  region: "us-central1" as const,
  timeoutSeconds: 120,
  memory: "512MiB" as const,
  concurrency: 50,
  secrets: [twilioAccountSid, twilioAuthToken, twilioWhatsAppFrom],
};

// Standard function configuration
export const standardFunctionConfig = {
  region: "us-central1" as const,
  timeoutSeconds: 60,
  memory: "256MiB" as const,
  concurrency: 100,
};

// Payment function configuration
export const paymentFunctionConfig = {
  region: "us-central1" as const,
  timeoutSeconds: 60,
  memory: "256MiB" as const,
  concurrency: 50,
  secrets: [allpayApiLogin, allpayApiKey],
};
