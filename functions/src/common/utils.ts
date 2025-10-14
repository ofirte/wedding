import { CallableRequest, HttpsError } from "firebase-functions/https";
import { WeddingRole } from "../shared";
import { AuthData } from "firebase-functions/tasks";
import { logger } from "firebase-functions";

export const isAuthenticated: (
  request: CallableRequest<any>
) => asserts request is CallableRequest & { auth: AuthData } = (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
};

export const isSufficientWeddingRole = ({
  userRole,
  neededRole,
}: {
  userRole: WeddingRole;
  neededRole: WeddingRole;
}): boolean => {
  const roleHierarchy = ["user", "producer", "admin"];
  return roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(neededRole);
};

/**
 * Validates that all required fields exist on request.data
 * and returns a typed subset.
 */
export function getValidatedData<T extends object, K extends keyof T>(
  data: T,
  requiredKeys: K[]
): Pick<T, K> {
  const missingKeys = requiredKeys.filter((key) => data[key] === undefined);

  if (missingKeys.length > 0) {
    throw new HttpsError(
      "invalid-argument",
      `Missing required fields: ${missingKeys.join(", ")}`
    );
  }

  // TypeScript guarantee: all requiredKeys exist, return subset
  return data as Pick<T, K>;
}

export function handleFunctionError(
  error: unknown,
  context: Record<string, any> = {},
  loggerErrorMessage: string
): never {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const lowerMsg = message.toLowerCase();

  // Always log
  logger.error(loggerErrorMessage, { ...context, error: message });

  // 1️⃣ Pass through HttpsErrors untouched
  if (error instanceof HttpsError) {
    throw error;
  }

  // 2️⃣ Input or validation issues
  if (
    lowerMsg.includes("invalid") ||
    lowerMsg.includes("missing") ||
    lowerMsg.includes("malformed") ||
    lowerMsg.includes("validation")
  ) {
    throw new HttpsError("invalid-argument", message);
  }

  // 3️⃣ Missing or forbidden access
  if (
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("unauthenticated") ||
    lowerMsg.includes("forbidden")
  ) {
    throw new HttpsError("unauthenticated", message);
  }

  if (lowerMsg.includes("permission")) {
    throw new HttpsError("permission-denied", message);
  }

  // 4️⃣ Resource or document not found
  if (lowerMsg.includes("not found") || lowerMsg.includes("no document")) {
    throw new HttpsError("not-found", message);
  }

  // 5️⃣ Network / external service issues
  if (
    lowerMsg.includes("network") ||
    lowerMsg.includes("fetch") ||
    lowerMsg.includes("axios") ||
    lowerMsg.includes("connection")
  ) {
    throw new HttpsError("unavailable", "External service unavailable");
  }

  // 6️⃣ Timeout or exceeded limits
  if (
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("deadline") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("limit")
  ) {
    throw new HttpsError(
      "deadline-exceeded",
      "Request timed out or limit exceeded"
    );
  }

  // 7️⃣ Generic internal error fallback
  throw new HttpsError("internal", "Internal server error");
}
