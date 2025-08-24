import isNil from "lodash/isNil";
import { deleteField } from "firebase/firestore";
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
 * Uses deleteField() to remove undefined values from Firebase
 */
export const formDataToRSVPStatus = (
  formData: RSVPFormData
): Partial<RSVPStatus> | Record<string, any> => {
  const result: Record<string, any> = {};

  // Handle attendance
  if (!isNil(formData.attending)) {
    result.attendance = formData.attending === "yes";
  }

  // Handle guest count (amount)
  if (formData.attending === "no") {
    // When not attending, explicitly remove amount field
    result.amount = deleteField();
  } else if (!isNil(formData.guestCount)) {
    result.amount = formData.guestCount;
  }

  // Handle sleepover
  if (formData.attending === "no") {
    // When not attending, explicitly remove sleepover field
    result.sleepover = deleteField();
  } else if (!isNil(formData.sleepover)) {
    result.sleepover = formData.sleepover === "yes";
  }

  // Handle ride from Tel Aviv
  if (formData.attending === "no") {
    // When not attending, explicitly remove ride field
    result.rideFromTelAviv = deleteField();
  } else if (!isNil(formData.needsRideFromTelAviv)) {
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
  if (isNil(rsvpStatus)) {
    return {
      attending: undefined,
      guestCount: undefined,
      sleepover: undefined,
      needsRideFromTelAviv: undefined,
    };
  }

  return {
    attending: !isNil(rsvpStatus.attendance)
      ? rsvpStatus.attendance
        ? "yes"
        : "no"
      : undefined,
    guestCount: !isNil(rsvpStatus.amount) ? rsvpStatus.amount : undefined,
    sleepover: !isNil(rsvpStatus.sleepover)
      ? rsvpStatus.sleepover
        ? "yes"
        : "no"
      : undefined,
    needsRideFromTelAviv: !isNil(rsvpStatus.rideFromTelAviv)
      ? rsvpStatus.rideFromTelAviv
        ? "yes"
        : "no"
      : undefined,
  };
};
