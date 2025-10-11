import { connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { functions } from "./firebaseConfig";

// Connect to emulator in development
if (
  process.env.NODE_ENV === "development" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("🔌 Connected to Firebase Functions emulator");
  } catch (error) {
    console.log(
      "Functions emulator connection failed, using deployed functions"
    );
  }
}

/**
 * Helper to call Firebase callable functions with automatic auth token handling
 */
export const callFirebaseFunction = async <T = any, P = any>(
  functionName: string,
  data?: P
): Promise<T> => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to call functions");
    }

    const callable = httpsCallable<P, { success: boolean } & T>(
      functions,
      functionName
    );
    const result = await callable(data);

    return result.data as T;
  } catch (error: any) {
    console.error(`Error calling function ${functionName}:`, error);

    // Handle Firebase Functions errors
    if (error.code) {
      switch (error.code) {
        case "functions/unauthenticated":
          throw new Error("Authentication required");
        case "functions/permission-denied":
          throw new Error("Permission denied");
        case "functions/not-found":
          throw new Error("Function not found");
        case "functions/invalid-argument":
          throw new Error(error.message || "Invalid arguments provided");
        case "functions/failed-precondition":
          throw new Error(error.message || "Operation failed");
        case "functions/internal":
          throw new Error(error.message || "Internal server error");
        default:
          throw new Error(error.message || "Unknown error occurred");
      }
    }

    throw error;
  }
};

// Re-export organized functions from the new structure
export * from "./firebaseFunctions/index";

// Legacy exports for backward compatibility
export const sendWhatsAppMessage = httpsCallable(
  functions,
  "sendWhatsAppMessage"
);
export const sendSmsMessage = httpsCallable(functions, "sendSmsMessage");
export const getMessageTemplates = httpsCallable(
  functions,
  "getMessageTemplates"
);
export const createMessageTemplate = httpsCallable(
  functions,
  "createMessageTemplate"
);
export const deleteMessageTemplate = httpsCallable(
  functions,
  "deleteMessageTemplate"
);
export const submitTemplateApproval = httpsCallable(
  functions,
  "submitTemplateApproval"
);
export const getTemplateApprovalStatus = httpsCallable(
  functions,
  "getTemplateApprovalStatus"
);
export const getMessageStatus = httpsCallable(functions, "getMessageStatus");
