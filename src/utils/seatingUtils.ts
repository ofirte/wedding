import { Invitee } from "@wedding-plan/types";

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

/**
 * Calculate total guest count for a list of invitees
 * Uses getGuestAmount to sum up actual guest amounts from RSVP data
 */
export const calculateTotalGuestCount = (invitees: Invitee[]): number => {
  return invitees.reduce((sum, invitee) => sum + getGuestAmount(invitee), 0);
};

/**
 * Calculate used capacity for a table based on assigned guest IDs
 */
export const calculateUsedCapacity = (
  assignedGuestIds: string[],
  allInvitees: Invitee[]
): number => {
  return assignedGuestIds.reduce((sum, guestId) => {
    const guest = allInvitees.find((inv) => inv.id === guestId);
    return sum + (guest ? getGuestAmount(guest) : 0);
  }, 0);
};
