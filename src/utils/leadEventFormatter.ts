import { LeadEvent } from "@wedding-plan/types";

/**
 * Format a lead event into a translated description
 * @param event The lead event to format
 * @param t Translation function
 * @param statusTranslator Function to translate status values
 * @returns Translated event description
 */
export const formatLeadEventDescription = (
  event: LeadEvent,
  t: (key: string) => string,
  statusTranslator: (status: string) => string
): string => {
  switch (event.type) {
    case "created":
      return t("leads.events.created");

    case "status_changed":
      if (event.metadata?.oldValue && event.metadata?.newValue) {
        const oldStatus = statusTranslator(event.metadata.oldValue);
        const newStatus = statusTranslator(event.metadata.newValue);
        return t("leads.events.statusChanged")
          .replace("{{oldStatus}}", oldStatus)
          .replace("{{newStatus}}", newStatus);
      }
      // Fallback to stored description if metadata is missing
      return event.description;

    case "field_updated":
      if (event.metadata?.fields && Array.isArray(event.metadata.fields)) {
        const fields = event.metadata.fields.join(", ");
        return t("leads.events.fieldUpdated").replace("{{fields}}", fields);
      }
      // Fallback to stored description if metadata is missing
      return event.description;

    case "note_added":
      // For notes, just return the description (which is the note text)
      return t("leads.events.noteAdded").replace("{{note}}", event.description);

    case "follow_up_set":
      if (event.metadata?.newValue) {
        const date = new Date(event.metadata.newValue).toLocaleDateString();
        return t("leads.events.followUpSet").replace("{{date}}", date);
      }
      // Fallback to stored description if metadata is missing
      return event.description;

    case "follow_up_completed":
      return t("leads.events.followUpCompleted");

    default:
      // For unknown event types, return the stored description
      return event.description;
  }
};
