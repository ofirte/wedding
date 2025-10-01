import isNil from "lodash/isNil";
/**
 * RSVP Status data structure for storing as subcollection under invitees
 */
export interface RSVPStatus {
  attendance: boolean;
  amount: number;
  sleepover: boolean;
  rideFromTelAviv: boolean;
  isSubmitted: boolean;
}

/**
 * RSVP Form Data type - maps to the form structure
 */
export interface RSVPFormData {
  attending: "yes" | "no" | undefined;
  guestCount: number | undefined;
  sleepover: "yes" | "no" | undefined;
  needsRideFromTelAviv: "yes" | "no" | undefined;
}

/**
 * Utility function to convert form data to RSVP status
 * For denormalized data structure - only includes fields that have values
 */
export const formDataToRSVPStatus = (
  formData: RSVPFormData
): Partial<RSVPStatus> => {
  const result: Partial<RSVPStatus> = {};

  // Only include fields that have actual values (not undefined)
  if (!isNil(formData.attending)) {
    result.attendance = formData.attending === "yes";
  }

  if (!isNil(formData.guestCount)) {
    result.amount = formData.guestCount;
  }

  if (!isNil(formData.sleepover)) {
    result.sleepover = formData.sleepover === "yes";
  }

  if (!isNil(formData.needsRideFromTelAviv)) {
    result.rideFromTelAviv = formData.needsRideFromTelAviv === "yes";
  }

  return result;
};

/**
 * Utility function to convert RSVP status to form data
 * Handles undefined/null values gracefully by providing appropriate defaults
 */
export const rsvpStatusToFormData = (
  rsvpStatus: Partial<RSVPStatus> | null | undefined
): RSVPFormData => {
  const yesNoFieldValue = (fieldValue: boolean | undefined) =>
    !isNil(fieldValue) ? (fieldValue ? "yes" : "no") : undefined;

  if (isNil(rsvpStatus)) {
    return {
      attending: undefined,
      guestCount: undefined,
      sleepover: undefined,
      needsRideFromTelAviv: undefined,
    };
  }

  return {
    attending: yesNoFieldValue(rsvpStatus.attendance),
    guestCount: !isNil(rsvpStatus.amount) ? rsvpStatus.amount : undefined,
    sleepover: yesNoFieldValue(rsvpStatus.sleepover),
    needsRideFromTelAviv: yesNoFieldValue(rsvpStatus.rideFromTelAviv),
  };
};

/**
 * Utility function to create a complete RSVP status object with defaults
 * For cases where you want to completely replace the RSVP status
 */
export const formDataToCompleteRSVPStatus = (
  formData: RSVPFormData
): RSVPStatus => {
  return {
    attendance: formData.attending === "yes",
    amount: formData.guestCount || 1,
    sleepover: formData.sleepover === "yes",
    rideFromTelAviv: formData.needsRideFromTelAviv === "yes",
    isSubmitted: false, // Will be set to true when officially submitted
  };
};

/**
 * Utility function to clear specific RSVP fields
 * Since deleteField() doesn't work with nested objects, we set to null/default values
 */
export const clearRSVPFields = (
  fieldsToKeep: Array<keyof RSVPStatus>
): Partial<RSVPStatus> => {
  const clearedStatus: Partial<RSVPStatus> = {};

  if (!fieldsToKeep.includes("attendance")) {
    clearedStatus.attendance = false;
  }
  if (!fieldsToKeep.includes("amount")) {
    clearedStatus.amount = 1;
  }
  if (!fieldsToKeep.includes("sleepover")) {
    clearedStatus.sleepover = false;
  }
  if (!fieldsToKeep.includes("rideFromTelAviv")) {
    clearedStatus.rideFromTelAviv = false;
  }
  if (!fieldsToKeep.includes("isSubmitted")) {
    clearedStatus.isSubmitted = false;
  }

  return clearedStatus;
};
