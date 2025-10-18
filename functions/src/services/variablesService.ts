import { Invitee, Wedding } from "@wedding-plan/types";
import { logger } from "firebase-functions/v2";

/**
 * Generate a personalized RSVP link for a specific guest and wedding
 */
const generateRSVPLink = (weddingId: string, guestId: string): string => {
  const baseUrl = "https://weddingplanerstudioapp.com";
  return `${baseUrl}/guest-rsvp/${weddingId}/${guestId}`;
};

/**
 * Generate payment link for wedding-related transactions
 */
const generatePaymentLink = (weddingId: string, guestId?: string): string => {
  const baseUrl = "https://weddingplanerstudioapp.com";
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
  wedding: Wedding
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
    const eventDate = formatDate(wedding.date);

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
