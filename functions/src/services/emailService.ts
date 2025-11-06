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
