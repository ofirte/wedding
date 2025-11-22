import sgMail from "@sendgrid/mail";
import { logger } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import {
  getInvitationEmailHTML,
  getInvitationEmailText,
  getInvitationEmailSubject,
  getReminderEmailHTML,
  getReminderEmailText,
  getReminderEmailSubject,
} from "../utils/emailTemplates";

// Define the SendGrid API key secret
export const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

/**
 * Initialize SendGrid with API key
 */
export const initializeSendGrid = () => {
  const apiKey = sendgridApiKey.value();
  if (!apiKey) {
    throw new Error("SendGrid API key is not configured");
  }
  sgMail.setApiKey(apiKey);
};

/**
 * Send a producer invitation email
 */
export const sendProducerInvitationEmail = async (
  to: string,
  token: string,
  inviterName: string,
  appUrl: string,
  language: "en" | "he" = "he"
): Promise<void> => {
  try {
    initializeSendGrid();

    const invitationUrl = `${appUrl}/login?inviteToken=${token}`;

    const msg = {
      to,
      from: {
        email: "ofirtene@weddingplannerstudioapp.com", // TODO: Update with your verified sender
        name: "WedOne Team",
      },
      subject: getInvitationEmailSubject(language),
      text: getInvitationEmailText(
        { inviterName, invitationUrl, recipientEmail: to },
        language
      ),
      html: getInvitationEmailHTML(
        { inviterName, invitationUrl, recipientEmail: to },
        language
      ),
    };

    await sgMail.send(msg);

    logger.info("Producer invitation email sent successfully", {
      to,
      inviterName,
      language,
    });
  } catch (error) {
    logger.error("Failed to send producer invitation email", {
      to,
      inviterName,
      error,
    });
    throw new Error(`Failed to send invitation email: ${error}`);
  }
};

/**
 * Send a reminder email for pending invitation
 */
export const sendInvitationReminderEmail = async (
  to: string,
  token: string,
  inviterName: string,
  appUrl: string,
  expiresAt: Date,
  language: "en" | "he" = "he"
): Promise<void> => {
  try {
    initializeSendGrid();

    const invitationUrl = `${appUrl}/login?inviteToken=${token}`;
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const msg = {
      to,
      from: {
        email: "ofirtene@weddingplannerstudioapp.com", // TODO: Update with your verified sender
        name: "WedOne Team",
      },
      subject: getReminderEmailSubject(language),
      text: getReminderEmailText(
        { inviterName, invitationUrl, daysRemaining },
        language
      ),
      html: getReminderEmailHTML(
        { inviterName, invitationUrl, daysRemaining },
        language
      ),
    };

    await sgMail.send(msg);

    logger.info("Invitation reminder email sent successfully", {
      to,
      inviterName,
      daysRemaining,
      language,
    });
  } catch (error) {
    logger.error("Failed to send invitation reminder email", {
      to,
      inviterName,
      error,
    });
    throw new Error(`Failed to send reminder email: ${error}`);
  }
};

/**
 * Send a support contact email from a user
 */
export const sendSupportContactEmail = async (
  userEmail: string,
  userName: string,
  subject: string,
  message: string
): Promise<void> => {
  try {
    initializeSendGrid();

    const msg = {
      to: "support@weddingplannerstudioapp.com",
      from: {
        email: "ofirtene@weddingplannerstudioapp.com",
        name: "WedOne Support Form",
      },
      replyTo: userEmail,
      subject: `Support Request: ${subject}`,
      text: `From: ${userName} (${userEmail})\n\nSubject: ${subject}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Support Request</h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    logger.info("Support contact email sent successfully", {
      userEmail,
      userName,
      subject,
    });
  } catch (error) {
    logger.error("Failed to send support contact email", {
      userEmail,
      userName,
      subject,
      error,
    });
    throw new Error(`Failed to send support contact email: ${error}`);
  }
};
