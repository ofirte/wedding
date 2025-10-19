import { Invitee, Wedding } from "@wedding-plan/types";
import { logger } from "firebase-functions/v2";

/**
 * Generate a personalized RSVP link for a specific guest and wedding
 */
const generateRSVPLink = (weddingId: string, guestId: string): string => {
  const baseUrl = "https://weddingplannerstudioapp.com";
  return `${baseUrl}/guest-rsvp/${weddingId}/${guestId}`;
};

/**
 * Generate payment link for wedding-related transactions
 */
const generatePaymentLink = (weddingId: string, guestId?: string): string => {
  const baseUrl = "https://weddingplannerstudioapp.com";
  let link = `${baseUrl}/payment/${weddingId}`;

  if (guestId) {
    link += `?guest=${guestId}`;
  }

  return link;
};

/**
 * Format date in a readable format
 */
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "TBD";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "TBD";

    return dateObj.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    logger.warn("Error formatting date", { date, error });
    return "TBD";
  }
};

/**
 * Populate content variables from invitee and wedding data
 */
export const populateContentVariables = (
  invitee: Invitee,
  wedding: Wedding,
  locale: "he" | "en"
): Record<string, string> => {
  try {
    logger.info("Populating content variables", {
      inviteeId: invitee.id,
      weddingId: wedding.id,
    });

    // Generate couple name from individual names or use provided name
    const coupleName =
      wedding.brideName && wedding.groomName
        ? `${wedding.brideName} & ${wedding.groomName}`
        : wedding.name || "The Happy Couple";

    // Format event date

    // Hebrew: use Hebrew locale with Hebrew calendar if available
    const eventDate =
      locale === "he"
        ? wedding.date.toLocaleDateString("he-IL").replace(/\./g, "/")
        : wedding.date.toLocaleDateString("en-US").replace(/\./g, "/");

    const variables = {
      guestName: invitee.name || "Dear Guest",
      eventDate: eventDate,
      eventStartTime: wedding.startTime || "TBD",
      coupleName: coupleName,
      rsvpLink: generateRSVPLink(wedding.id, invitee.id),
      paymentLink: generatePaymentLink(wedding.id, invitee.id),
      giftLink: `https://registry.example.com/${wedding.id}`, // Placeholder
      // Legacy variables for backward compatibility
      guestId: invitee.id,
      weddingId: wedding.id,
    };

    logger.info("Content variables populated", {
      variableCount: Object.keys(variables).length,
      variables: Object.keys(variables),
    });

    return variables;
  } catch (error) {
    logger.error("Error populating content variables", {
      inviteeId: invitee.id,
      weddingId: wedding.id,
      error,
    });

    // Return minimal fallback variables
    return {
      guestName: invitee.name || "Dear Guest",
      eventDate: formatDate(wedding.date),
      eventStartTime: formatDate(wedding.startTime),
      coupleName: wedding.name || "The Happy Couple",
      rsvpLink: generateRSVPLink(wedding.id, invitee.id),
      paymentLink: generatePaymentLink(wedding.id, invitee.id),
      giftLink: "",
      guestId: invitee.id,
      weddingId: wedding.id,
    };
  }
};
