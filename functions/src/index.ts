import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import twilio from "twilio";
import {
  MessageTemplatesResponse,
  WebhookMessageStatusPayload,
} from "./messagesService/types";
import { updateMessageStatus } from "./messagesService/routes";

// Initialize Firebase Admin SDK
initializeApp();

// Define Twilio parameters
const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioWebhookSecret = defineString("TWILIO_WEBHOOK_SECRET", {
  default: "",
});
const twilioWhatsAppFrom = defineString("TWILIO_WHATSAPP_FROM", {
  default: "whatsapp:+15558003977",
});

// Set global options for all functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 60,
  memory: "256MiB",
  concurrency: 80,
});

const api = express();

api.options("*", cors());
api.use(express.json());
api.options("*", cors());

api.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

api.post("/messages/send-message", async (req, res) => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const twilioPhone = twilioWhatsAppFrom.value();
  const twilioClient =
    accountSid && authToken ? twilio(accountSid, authToken) : null;
  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { to, contentSid, contentVariables } = req.body;
    const message = await twilioClient.messages.create({
      from: twilioPhone,
      contentSid,
      contentVariables: JSON.stringify(contentVariables),
      to,
    });
    return res.status(200).json({
      sid: message.sid,
      status: message.status,
      from: message.from,
      to: message.to,
      dateCreated: message.dateCreated,
    });
  } catch (error) {
    console.error("Error sending Twilio message:", error);
    return res.status(500).json({
      error: "Failed to send message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

api.get("/messages/templates", async (req, res) => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const twilioClient =
    accountSid && authToken ? twilio(accountSid, authToken) : null;

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const contentList = await twilioClient.content.v2.contents.list();
    const response: MessageTemplatesResponse = {
      templates: contentList,
      length: contentList.length,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching Twilio content templates:", error);
    return res.status(500).json({
      error: "Failed to fetch message templates",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Test endpoint for webhook
api.get("/webhooks/message-status", (req, res) => {
  res.status(200).json({
    message: "Twilio message status webhook endpoint is ready",
    timestamp: new Date().toISOString(),
  });
});

// Webhook for Twilio message status updates
api.post("/webhooks/message-status", async (req, res) => {
  try {
    // Optional: Validate Twilio webhook signature for security
    const webhookSecret = twilioWebhookSecret.value();
    if (webhookSecret) {
      const twilioSignature = req.headers["x-twilio-signature"] as string;
      if (!twilioSignature) {
        return res.status(401).json({ error: "Missing Twilio signature" });
      }

      // In production, you should validate the signature here
      // const isValid = twilio.validateRequest(webhookSecret, JSON.stringify(req.body), url, twilioSignature);
      // if (!isValid) {
      //   return res.status(401).json({ error: "Invalid Twilio signature" });
      // }
    }

    const payload: WebhookMessageStatusPayload = req.body;

    console.log("Received message status webhook:", payload);

    if (!payload.MessageSid) {
      return res.status(400).json({ error: "MessageSid is required" });
    }

    const result = await updateMessageStatus(payload);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing message status webhook:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        error: "Message not found",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to process webhook",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const app = onRequest(api);
