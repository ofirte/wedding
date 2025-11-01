/**
 * Utility functions for template management and wedding ID handling
 */

import { TemplatesCategories } from "@wedding-plan/types";

// Utility functions for template name formatting and display
// Examples:
// formatTemplateName("Welcome Message!") -> "welcome_message"
// formatTemplateName("RSVP @ 2024") -> "rsvp_2024"
// stripWeddingIdFromTemplateName("welcome_message") -> "Welcome Message"

/**
 * Category options for templates with translation keys
 */
export const TEMPLATE_CATEGORY_OPTIONS: Array<{
  value: TemplatesCategories;
  translationKey: string;
}> = [
  {
    value: "initialRsvp",
    translationKey: "userRsvp.messagesPlan.initialRsvp.title",
  },
  {
    value: "secondRsvp",
    translationKey: "userRsvp.messagesPlan.secondRsvp.title",
  },
  {
    value: "finalRsvp",
    translationKey: "userRsvp.messagesPlan.finalRsvp.title",
  },
  {
    value: "dayBefore",
    translationKey: "userRsvp.messagesPlan.dayBefore.title",
  },
  {
    value: "dayAfterThankyou",
    translationKey: "userRsvp.messagesPlan.dayAfterThankyou.title",
  },
];

/**
 * Get translated category label for a given category value
 * @param category The category value
 * @param t Translation function
 * @returns Translated category label
 */
export const getCategoryLabel = (
  category: TemplatesCategories | undefined,
  t: (key: string) => string
): string => {
  if (!category) return t("templates.uncategorized");

  const categoryOption = TEMPLATE_CATEGORY_OPTIONS.find(
    (option) => option.value === category
  );

  return categoryOption ? t(categoryOption.translationKey) : category;
};

/**
 * Formats a template name to comply with Twilio requirements:
 * - Only lowercase alphanumeric characters and underscores
 * - No spaces or special characters allowed
 * @param name The user-friendly template name
 * @returns The Twilio-compliant template name
 */
export const formatTemplateName = (name: string): string => {
  return (
    name
      .trim()
      .toLowerCase()
      // Replace spaces with underscores
      .replace(/\s+/g, "_")
      // Remove all characters that are not alphanumeric or underscore
      .replace(/[^a-z0-9_]/g, "")
      // Remove multiple consecutive underscores
      .replace(/_+/g, "_")
      // Remove leading/trailing underscores
      .replace(/^_|_$/g, "") ||
    // Ensure we have at least some content, fallback to "template" if empty
    "template"
  );
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
  // Convert underscores back to spaces and capitalize first letter of each word
  return friendlyName
    ?.replace(/_/g, " ")
    ?.split(" ")
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    ?.join(" ");
};
