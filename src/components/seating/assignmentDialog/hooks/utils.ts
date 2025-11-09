import { Invitee } from "../../../../../shared/src/models/invitee";

/**
 * Get the number of guests for an invitee based on their RSVP amount
 * Defaults to 1 if amount is not specified or invalid
 */
export const getGuestAmount = (invitee: Invitee): number => {
  if (!invitee.rsvpStatus?.amount) {
    return 1;
  }

  const amount = parseInt(invitee.rsvpStatus.amount, 10);
  return isNaN(amount) || amount < 1 ? 1 : amount;
};
