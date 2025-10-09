/**
 * Example usage of the organized Firebase Functions
 */

import {
  // Enums for type safety
  AuthFunctions,
  MessagingFunctions,
  TemplateFunctions,

  // Organized function collections
  authFunctions,
  messagingFunctions,
  templateFunctions,

  // Individual function exports
  setUserCustomClaims,
  sendWhatsAppMessage,
  getMessageTemplates,

  // Types
  type FunctionName,
} from "../api/firebaseFunctions/index";

/**
 * Example 1: Using enum-based approach for type safety
 */
const addUserWithEnum = async () => {
  try {
    const result = await authFunctions[AuthFunctions.SET_USER_CUSTOM_CLAIMS]({
      userId: "user123",
      weddingId: "wedding456",
      role: "bride",
    });

    console.log("User added:", result.data);
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Example 2: Using direct function imports
 */
const addUserDirect = async () => {
  try {
    const result = await setUserCustomClaims({
      userId: "user123",
      weddingId: "wedding456",
      role: "bride",
    });

    console.log("User added:", result.data);
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Example 3: Using organized collections
 */
const sendMessage = async () => {
  try {
    // Send WhatsApp message
    const whatsappResult = await messagingFunctions[
      MessagingFunctions.SEND_WHATSAPP_MESSAGE
    ]({
      to: "whatsapp:+1234567890",
      contentSid: "template123",
      contentVariables: {
        name: "John",
        date: "2025-12-25",
      },
    });

    // Send SMS fallback
    const smsResult = await messagingFunctions[
      MessagingFunctions.SEND_SMS_MESSAGE
    ]({
      to: "+1234567890",
      contentSid: "template123",
      contentVariables: {
        name: "John",
        date: "2025-12-25",
      },
    });

    console.log("Messages sent:", { whatsappResult, smsResult });
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Example 4: Template management
 */
const manageTemplates = async () => {
  try {
    // Get all templates
    const templates = await templateFunctions[
      TemplateFunctions.GET_MESSAGE_TEMPLATES
    ]();
    console.log("Templates:", templates.data);

    // Create new template
    const newTemplate = await templateFunctions[
      TemplateFunctions.CREATE_MESSAGE_TEMPLATE
    ]({
      friendly_name: "Wedding Invitation",
      language: "en",
      variables: {
        bride_name: "string",
        groom_name: "string",
        wedding_date: "string",
      },
      types: {
        "twilio/text": {
          body: "Hi {{bride_name}} & {{groom_name}}! Your wedding on {{wedding_date}} is confirmed!",
        },
      },
    });
    console.log("Template created:", newTemplate.data);
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Example 5: Type-safe function name usage
 */
const getFunctionName = (
  category: "auth" | "messaging" | "template"
): FunctionName => {
  switch (category) {
    case "auth":
      return AuthFunctions.SET_USER_CUSTOM_CLAIMS;
    case "messaging":
      return MessagingFunctions.SEND_WHATSAPP_MESSAGE;
    case "template":
      return TemplateFunctions.GET_MESSAGE_TEMPLATES;
    default:
      throw new Error("Unknown category");
  }
};

export {
  addUserWithEnum,
  addUserDirect,
  sendMessage,
  manageTemplates,
  getFunctionName,
};
