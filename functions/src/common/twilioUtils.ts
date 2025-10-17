import { logger } from "firebase-functions";
import { twilioAccountSid, twilioAuthToken } from "./config";
import { HttpsError } from "firebase-functions/https";
import twilio from "twilio";

// Helper function to initialize Twilio client
export const initializeTwilioClient = () => {
  try {
    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    if (!accountSid || !authToken) {
      logger.error("Twilio credentials are not set");
      throw new HttpsError(
        "failed-precondition",
        "Twilio credentials are not configured"
      );
    }
    return twilio(accountSid, authToken);
  } catch (error) {
    logger.error("Error initializing Twilio client", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new HttpsError("internal", "Failed to initialize Twilio client");
  }
};