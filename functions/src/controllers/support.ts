import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { standardFunctionConfig } from "../common/config";
import { handleFunctionError, isAuthenticated } from "../common/utils";
import { sendSupportContactEmail, sendgridApiKey } from "../services/emailService";

/**
 * Request interface for sending support contact
 */
interface SendSupportContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Response interface for sending support contact
 */
interface SendSupportContactResponse {
  success: boolean;
  message: string;
}

/**
 * Send a support contact email
 * Only authenticated users can call this function
 */
export const sendSupportContact = onCall<SendSupportContactRequest>(
  {
    ...standardFunctionConfig,
    secrets: [sendgridApiKey],
  },
  async (request): Promise<SendSupportContactResponse> => {
    isAuthenticated(request);

    const { name, email, subject, message } = request.data;

    try {
      // Validate required fields
      if (!name || !name.trim()) {
        throw new Error("Name is required");
      }
      if (!email || !email.trim()) {
        throw new Error("Email is required");
      }
      if (!subject || !subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!message || !message.trim()) {
        throw new Error("Message is required");
      }

      // Validate field lengths
      if (subject.length > 200) {
        throw new Error("Subject must be less than 200 characters");
      }
      if (message.length < 10) {
        throw new Error("Message must be at least 10 characters");
      }
      if (message.length > 1000) {
        throw new Error("Message must be less than 1000 characters");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Send support contact email
      await sendSupportContactEmail(email, name, subject, message);

      logger.info("Support contact email sent successfully", {
        email,
        subject,
        sentBy: request.auth.uid,
      });

      return {
        success: true,
        message: "Support request sent successfully",
      };
    } catch (error) {
      handleFunctionError(
        error,
        { email, subject, requestingUser: request.auth.uid },
        "Failed to send support contact"
      );
    }
  }
);
