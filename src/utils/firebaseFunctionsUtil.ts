/**
 * Utility functions for Firebase Functions API calls
 */
import { auth } from "../api/firebaseConfig";

/**
 * Get the base URL for Firebase Functions based on the current environment
 * @returns The base URL for Firebase Functions
 */
export const getBaseUrl = (): string => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const isProduction = process.env.NODE_ENV === "production";

  if (isLocal) {
    return "http://127.0.0.1:5001/wedding-c89a1/us-central1/app";
  }
  if (isProduction) {
    return "https://app-ga5vulihbq-uc.a.run.app";
  }
  if (isDevelopment) {
    return "https://app-fhntq3wlyq-uc.a.run.app";
  }
  return "http://127.0.0.1:5001/wedding-c89a1/us-central1/app";
};

/**
 * Call a Firebase Function with authentication
 * @param functionName - Name of the function to call
 * @param data - Data to send to the function
 * @returns Promise with the function result
 */
export const callFirebaseFunction = async (
  functionName: string,
  data: any = {}
): Promise<any> => {
  const baseUrl = getBaseUrl();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be authenticated to call Firebase Functions");
  }

  // Get the user's ID token for authentication
  const idToken = await user.getIdToken();

  const response = await fetch(`${baseUrl}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
};
