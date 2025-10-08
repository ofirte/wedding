/**
 * Utility functions for template management and wedding ID handling
 */

// Utility functions for wedding ID handling
// Examples:
// addWeddingIdToTemplateName("Welcome Message", "abc123def456") -> "welcome_message_abc123de"
// stripWeddingIdFromTemplateName("welcome_message_abc123de") -> "Welcome Message"

/**
 * Adds a wedding ID suffix to a template name for Twilio storage
 * @param name The user-friendly template name
 * @param weddingId The full wedding ID
 * @returns The template name with wedding ID suffix for Twilio
 */
export const addWeddingIdToTemplateName = (
  name: string,
  weddingId: string
): string => {
  // Create a short version of wedding ID (first 8 characters)
  const shortWeddingId = weddingId.substring(0, 8);
  return `${name.trim().toLowerCase().replace(/\s+/g, "_")}_${shortWeddingId}`;
};

/**
 * Strips the wedding ID suffix from a template name and formats it for display
 * @param friendlyName The Twilio-stored template name with wedding ID suffix
 * @returns The clean, formatted name for display
 */
export const stripWeddingIdFromTemplateName = (
  friendlyName: string
): string => {
  // Remove wedding ID suffix pattern: _[8-character-id] from the end
  const cleanName = friendlyName.replace(/_[a-zA-Z0-9]{8}$/, "");
  // Convert underscores back to spaces and capitalize first letter of each word
  return cleanName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
