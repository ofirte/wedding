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

// Helper function to initialize Twilio client
const initializeTwilioClient = () => {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  return accountSid && authToken ? twilio(accountSid, authToken) : null;
};

const corsMiddleware = cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS", "DELETE"],
  credentials: true,
});

// apply it globally
api.use(corsMiddleware);
api.use(express.json());

api.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

api.post("/messages/send-message", async (req, res) => {
  const twilioClient = initializeTwilioClient();
  const twilioPhone = twilioWhatsAppFrom.value();

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
  const twilioClient = initializeTwilioClient();

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
  const twilioClient = initializeTwilioClient();

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

// Create a new Twilio content template
api.post("/messages/create-template", async (req, res) => {
  const twilioClient = initializeTwilioClient();

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { friendly_name, language, variables, types } = req.body;

    // Validate required fields
    if (!friendly_name || !language) {
      return res.status(400).json({
        error:
          "Missing required fields: friendly_name and language are required",
      });
    }

    if (!types || Object.keys(types).length === 0) {
      return res.status(400).json({
        error: "At least one content type must be provided in 'types' field",
      });
    }

    // Create the content template using Twilio API
    const createdTemplate = await twilioClient.content.v1.contents.create({
      friendly_name: friendly_name,
      language: language,
      variables: variables || {},
      types: types,
    });

    return res.status(201).json(createdTemplate);
  } catch (error) {
    console.error("Error creating Twilio content template:", error);
    return res.status(500).json({
      error: "Failed to create message template",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Delete a Twilio content template
api.delete("/messages/delete-template/:templateSid", async (req, res) => {
  const twilioClient = initializeTwilioClient();

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { templateSid } = req.params;

    if (!templateSid) {
      return res.status(400).json({
        error: "Template SID is required",
      });
    }

    // Delete the content template using Twilio API
    await twilioClient.content.v1.contents(templateSid).remove();

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
      templateSid: templateSid,
    });
  } catch (error) {
    console.error("Error deleting Twilio content template:", error);

    // Handle specific Twilio errors
    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        error: "Template not found",
        details: error.message,
        templateSid: req.params.templateSid,
      });
    }

    return res.status(500).json({
      error: "Failed to delete message template",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Submit template for WhatsApp approval
api.post(
  "/messages/submit-template-approval/:templateSid",
  async (req, res) => {
    const twilioClient = initializeTwilioClient();

    if (!twilioClient) {
      return res.status(500).json({ error: "Twilio client not configured." });
    }

    try {
      const { templateSid } = req.params;
      const { name, category } = req.body;

      if (!templateSid) {
        return res.status(400).json({
          error: "Template SID is required",
        });
      }

      if (!name || !category) {
        return res.status(400).json({
          error:
            "Both 'name' and 'category' are required for WhatsApp approval",
        });
      }

      // Submit the template for WhatsApp approval using Twilio Content API
      // Based on Twilio docs: POST to /v1/Content/{ContentSid}/ApprovalRequests/whatsapp
      const accountSid = twilioAccountSid.value();
      const authToken = twilioAuthToken.value();
      const url = `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests/whatsapp`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        },
        body: JSON.stringify({
          name: name,
          category: category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const approvalRequest = await response.json();

      return res.status(201).json(approvalRequest);
    } catch (error) {
      console.error("Error submitting template for approval:", error);

      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({
          error: "Template not found",
          details: error.message,
          templateSid: req.params.templateSid,
        });
      }

      return res.status(500).json({
        error: "Failed to submit template for approval",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get template approval status
api.get("/messages/approval-status/:templateSid", async (req, res) => {
  const twilioClient = initializeTwilioClient();

  if (!twilioClient) {
    return res.status(500).json({ error: "Twilio client not configured." });
  }

  try {
    const { templateSid } = req.params;

    if (!templateSid) {
      return res.status(400).json({
        error: "Template SID is required",
      });
    }

    // Fetch approval status from Twilio Content API
    // Based on Twilio docs: GET /v1/Content/{ContentSid}/ApprovalRequests
    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    const url = `https://content.twilio.com/v1/Content/${templateSid}/ApprovalRequests`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const approvalData = await response.json();

    return res.status(200).json({
      templateSid: templateSid,
      approvalData: approvalData,
    });
  } catch (error) {
    console.error("Error fetching approval status:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        error: "Template not found",
        details: error.message,
        templateSid: req.params.templateSid,
      });
    }

    return res.status(500).json({
      error: "Failed to fetch approval status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get message status from Twilio
api.get("/messages/status/:messageSid", async (req, res) => {
  const twilioClient = initializeTwilioClient();

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
