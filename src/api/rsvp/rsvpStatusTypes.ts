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
  const yesNoFieldValue = (fieldValue: "yes" | "no" | undefined) => {
    if (isNil(fieldValue)) return deleteField();
    return fieldValue === "yes";
  };
  const result = {
    attendance: yesNoFieldValue(formData.attending),
    amount: isNil(formData.guestCount) ? deleteField() : formData.guestCount,
    sleepover: yesNoFieldValue(formData.sleepover),
    rideFromTelAviv: yesNoFieldValue(formData.needsRideFromTelAviv),
  };
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
