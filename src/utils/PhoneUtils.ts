/**
 * Utility functions for phone number formatting and validation
 */

/**
 * Format a phone number to a standard 10-digit format
 * Removes all non-digit characters and formats as XXXXXXXXXX
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Handle different phone number formats
  if (digitsOnly.length === 10) {
    // Already 10 digits
    return digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    // US number with country code (remove the 1)
    return digitsOnly.substring(1);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith("972")) {
    // Israeli number with country code (remove 972 and add leading 0 if needed)
    const withoutCountryCode = digitsOnly.substring(3);
    return withoutCountryCode.startsWith("0")
      ? withoutCountryCode
      : "0" + withoutCountryCode;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("972")) {
    // Israeli number with country code but missing digit
    return "0" + digitsOnly.substring(3);
  } else if (digitsOnly.length === 9 && !digitsOnly.startsWith("0")) {
    // Israeli mobile without leading 0
    return "0" + digitsOnly;
  }

  // Return as-is if we can't determine the format
  return digitsOnly;
};

/**
 * Display a phone number in a user-friendly format
 * Formats as XXX-XXX-XXXX for 10-digit numbers
 */
export const displayPhoneNumber = (phoneNumber: string): string => {
  const formatted = formatPhoneNumber(phoneNumber);

  if (formatted.length === 10 && formatted.startsWith("0")) {
    // Israeli format: 0XX-XXX-XXXX
    return `${formatted.substring(0, 3)}-${formatted.substring(
      3,
      6
    )}-${formatted.substring(6)}`;
  }
  else if (formatted.length === 10) {
    // US format: XXX-XXX-XXXX
    return `${formatted.substring(0, 3)}-${formatted.substring(
      3,
      6
    )}-${formatted.substring(6)}`;
  } 

  // Return formatted digits if we can't make a nice display format
  return formatted;
};

/**
 * Validate if a phone number is valid (has at least 10 digits)
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);
  return formatted.length >= 10;
};
