/**
 * Centralized message variable system for template creation and message sending
 * Handles variable definitions, population, and replacement across the RSVP system
 */

import { Wedding } from "../api/wedding/weddingApi";
import { Invitee } from "../components/invitees/InviteList";

export interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  description?: string;
}

export interface PopulatedVariables {
  [key: string]: string;
}

// Type for message variable population - using Partial to allow missing fields
export type MessageWedding = Partial<
  Pick<Wedding, "id" | "brideName" | "groomName" | "startTime">
> & {
  id: string; // id is required
  name?: string;
  eventDate?: string; // Computed from Wedding.date if needed
  coupleName?: string; // Computed from brideName & groomName
};

export type MessageGuest = Pick<Invitee, "id" | "name"> & {
  cellphone?: string;
};

/**
 * Predefined variables available for all message templates
 * These variables can be used in template creation and will be populated during message sending
 */
export const PREDEFINED_VARIABLES: TemplateVariable[] = [
  {
    key: "guestName",
    label: "Guest Name",
    placeholder: "John & Jane",
    description: "The name of the guest or couple receiving the message",
  },
  {
    key: "eventDate",
    label: "Event Date",
    placeholder: "June 15, 2025",
    description: "The wedding date",
  },
  {
    key: "eventStartTime",
    label: "Event Start Time",
    placeholder: "18:00",
    description: "When the wedding ceremony begins",
  },
  {
    key: "coupleName",
    label: "Couple Name",
    placeholder: "Sarah & David",
    description: "The names of the bride and groom",
  },
  {
    key: "rsvpLink",
    label: "RSVP Link",
    placeholder: "https://weddingplan.app/rsvp/...",
    description: "Personalized link for the guest to RSVP",
  },
  {
    key: "paymentLink",
    label: "Payment Link",
    placeholder: "https://payment.link/...",
    description: "Link for wedding-related payments",
  },
  {
    key: "giftLink",
    label: "Gift Link",
    placeholder: "https://registry.link/...",
    description: "Link to wedding registry or gift list",
  },
];

/**
 * Generate a personalized RSVP link for a specific guest and wedding
 * @param weddingId The wedding ID
 * @param guestId The guest ID
 * @param baseUrl Optional base URL (defaults to current origin)
 * @returns Complete RSVP URL with guest context
 */
export const generateRSVPLink = (
  weddingId: string,
  guestId: string,
  baseUrl?: string
): string => {
  const origin =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://weddingplanstudioapp.com");
  return `${origin}/guest-rsvp/${weddingId}/${guestId}`;
};

/**
 * Generate payment link for wedding-related transactions
 * @param weddingId The wedding ID
 * @param guestId Optional guest ID for personalization
 * @param amount Optional amount for specific payment
 * @returns Payment URL
 */
export const generatePaymentLink = (
  weddingId: string,
  guestId?: string,
  amount?: number
): string => {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://weddingplanstudio.web.app";
  let link = `${origin}/payment/${weddingId}`;

  const params = new URLSearchParams();
  if (guestId) params.append("guest", guestId);
  if (amount) params.append("amount", amount.toString());

  const queryString = params.toString();
  return queryString ? `${link}?${queryString}` : link;
};

/**
 * Populate all predefined variables with actual values for a specific guest and wedding
 * @param guest The guest receiving the message
 * @param wedding The wedding context
 * @returns Object with all variables populated with real values
 */
export const populateVariables = (
  guest: MessageGuest,
  wedding: MessageWedding
): PopulatedVariables => {
  // Generate couple name from individual names or use provided coupleName
  const coupleName =
    wedding.coupleName ||
    (wedding.brideName && wedding.groomName
      ? `${wedding.brideName} & ${wedding.groomName}`
      : wedding.name || "The Happy Couple");

  // Format event date from wedding date if available
  const eventDate =
    wedding.eventDate ||
    (wedding as any).date?.toDate?.()?.toLocaleDateString() ||
    "TBD";

  return {
    guestName: guest.name || "Dear Guest",
    eventDate: eventDate,
    eventStartTime: wedding.startTime || "TBD",
    coupleName: coupleName,
    rsvpLink: generateRSVPLink(wedding.id, guest.id),
    paymentLink: generatePaymentLink(wedding.id, guest.id),
    giftLink: `https://registry.example.com/${wedding.id}`, // Placeholder for now
    // Legacy variables for backward compatibility
    guestId: guest.id,
    weddingId: wedding.id,
  };
};

/**
 * Replace variables in a template text with actual values
 * Supports both {{variable}} and {variable} formats for backward compatibility
 * @param templateText The template text containing variable placeholders
 * @param variables The populated variables object
 * @returns Template text with variables replaced by actual values
 */
export const replaceVariables = (
  templateText: string,
  variables: PopulatedVariables
): string => {
  let result = templateText;

  // Replace each variable in the text
  Object.entries(variables).forEach(([key, value]) => {
    // Replace {{variable}} format (preferred)
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    // Replace {variable} format (legacy support)
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  return result;
};

/**
 * Extract used variables from template text
 * @param templateText The template text to analyze
 * @returns Array of variable keys that are used in the template
 */
export const extractUsedVariables = (templateText: string): string[] => {
  const matches = templateText.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map((match) => match.slice(2, -2));
};

/**
 * Validate that all used variables in template text are supported
 * @param templateText The template text to validate
 * @returns Object with validation result and any unsupported variables
 */
export const validateTemplateVariables = (
  templateText: string
): {
  isValid: boolean;
  unsupportedVariables: string[];
  supportedVariables: string[];
} => {
  const usedVariables = extractUsedVariables(templateText);
  const supportedVariableKeys = PREDEFINED_VARIABLES.map((v) => v.key);

  // Add legacy variables for backward compatibility
  supportedVariableKeys.push("guestId", "weddingId");

  const supportedVariables = usedVariables.filter((v) =>
    supportedVariableKeys.includes(v)
  );

  const unsupportedVariables = usedVariables.filter(
    (v) => !supportedVariableKeys.includes(v)
  );

  return {
    isValid: unsupportedVariables.length === 0,
    unsupportedVariables,
    supportedVariables,
  };
};

/**
 * Get variable definition by key
 * @param key The variable key to look up
 * @returns Variable definition or undefined if not found
 */
export const getVariableDefinition = (
  key: string
): TemplateVariable | undefined => {
  return PREDEFINED_VARIABLES.find((v) => v.key === key);
};
