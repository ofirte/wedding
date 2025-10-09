import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";

// Initialize Firebase Admin SDK
initializeApp();

// Set global options for all functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 120,
  memory: "512MiB",
  concurrency: 50,
});

// Export all auth functions
export * from "./auth/customClaims";

// Export all messaging functions
export * from "./messagesService/messaging";
export * from "./messagesService/templates";
