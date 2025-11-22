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

export * from "./controllers/auth";
export * from "./controllers/invitations";
export * from "./controllers/users";
export * from "./controllers/messages";
export * from "./controllers/templates";
export * from "./controllers/messagesAutomation";
export * from "./controllers/payments";
export * from "./controllers/support";
