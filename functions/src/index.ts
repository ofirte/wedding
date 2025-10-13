import { setGlobalOptions } from "firebase-functions/v2";
import { initializeFirebaseAdmin } from "./common/firebaseAdmin";

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Set global options for all functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 120,
  memory: "512MiB",
  concurrency: 50,
});

// Export NEW auth functions (clean system)
export * from "./auth/userRoles";
export * from "./auth/users";

// Export all messaging functions
export * from "./messagesService/messaging";
export * from "./messagesService/templates";
