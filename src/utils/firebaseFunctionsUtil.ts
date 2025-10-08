/**
 * Utility functions for Firebase Functions API calls
 */

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
