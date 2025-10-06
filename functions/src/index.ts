import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import twilio from "twilio";
import { MessageTemplatesResponse } from "./messagesService/types";

// Initialize Firebase Admin SDK
initializeApp();

// Define Twilio parameters
const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioWhatsAppFrom = defineString("TWILIO_WHATSAPP_FROM");

// Set global options for all functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 60,
  memory: "256MiB",
  concurrency: 80,
});

const api = express();

const corsMiddleware = cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
});

// apply it globally
api.use(corsMiddleware);
api.use(express.json());

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

// SMS endpoint - same signature as WhatsApp but converts template to plain text
api.post("/messages/send-sms", async (req, res) => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const twilioClient =
    accountSid && authToken ? twilio(accountSid, authToken) : null;

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { to, contentSid, contentVariables } = req.body;

    // Get template and convert to SMS text
    const contentList = await twilioClient.content.v2.contents.list();
    const template = contentList.find((content) => content.sid === contentSid);

    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    // Extract template body and replace variables
    const textType =
      template.types?.["twilio/text"] || template.types?.["whatsapp"];
    const templateBody = (textType as any)?.body;

    if (!templateBody || typeof templateBody !== "string") {
      return res.status(400).json({ error: "No template body found" });
    }

    let smsText = templateBody;
    Object.entries(contentVariables).forEach(([key, value]) => {
      smsText = smsText.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value as string
      );
    });

    // Clean phone number and send SMS
    const cleanPhoneNumber = to.replace(/^whatsapp:/, "");

    const message = await twilioClient.messages.create({
      from: "weddingPlan",
      to: cleanPhoneNumber,
      body: smsText,
    });

    return res.status(200).json({
      sid: message.sid,
      status: message.status,
      from: message.from,
      to: message.to,
      dateCreated: message.dateCreated,
      messageType: "sms",
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return res.status(500).json({
      error: "Failed to send SMS",
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

// Get message status from Twilio
api.get("/messages/status/:messageSid", async (req, res) => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const twilioClient =
    accountSid && authToken ? twilio(accountSid, authToken) : null;

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { messageSid } = req.params;

    if (!messageSid) {
      return res.status(400).json({ error: "Message SID is required" });
    }

    // Fetch message status from Twilio
    const message = await twilioClient.messages(messageSid).fetch();

    return res.status(200).json({
      messageInfo: message,
    });
  } catch (error) {
    console.error("Error fetching message status from Twilio:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        error: "Message not found",
        details: error.message,
        messageSid: req.params.messageSid,
      });
    }
    return res.status(500).json({
      error: "Failed to fetch message status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const app = onRequest(api);
