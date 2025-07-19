import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import express from "express";
import cors from "cors";
import twilio from "twilio";

// Initialize Firebase Admin SDK
initializeApp();

// Define Twilio parameters
const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioWhatsAppFrom = "whatsapp:+15558047639";
//  defineString("TWILIO_WHATSAPP_FROM", {
//   default: "whatsapp:+14155238886",
// });

// Set global options for all functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 60,
  memory: "256MiB",
  concurrency: 80,
});

const api = express();

api.use(cors({ origin: "http://localhost:3000" }));
api.use(express.json());
api.options("*", cors({ origin: "http://localhost:3000" }));

api.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Send message endpoint
api.post("/messages/send-message", async (req, res) => {
  // Get parameter values at runtime
  console.log("hello from send-message");
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const twilioPhone = twilioWhatsAppFrom;

  console.log(accountSid, authToken);
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
      contentVariables,
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

export const app = onRequest(api);
