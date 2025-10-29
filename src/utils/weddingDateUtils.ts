import { differenceInDays } from "date-fns";

/**
 * Normalize date to UTC midnight for consistent date comparison
 * This ensures dates are compared based on calendar days, not time components
 */
export const normalizeToUTCMidnight = (date: Date): Date => {
  const normalizedDate = new Date(date);
  return new Date(
    Date.UTC(
      normalizedDate.getUTCFullYear(),
      normalizedDate.getUTCMonth(),
      normalizedDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
};

/**
 * Calculates the offset of a given date relative to the wedding date
 * and returns a human-readable description
 * Both dates are normalized to UTC midnight for accurate comparison
 */
export const getWeddingDayOffset = (
  scheduledTime: Date,
  weddingDate: Date,
  t: (key: string, options?: any) => string
): string => {
  // Normalize both dates to UTC midnight for accurate day comparison
  const normalizedScheduledTime = normalizeToUTCMidnight(scheduledTime);
  const normalizedWeddingDate = normalizeToUTCMidnight(weddingDate);

  const daysDiff = differenceInDays(
    normalizedScheduledTime,
    normalizedWeddingDate
  );

  if (daysDiff === 0) {
    return t("common.weddingDay");
  } else if (daysDiff > 0) {
    return t("userRsvp.scheduler.daysAfter", { days: Math.abs(daysDiff) });
  } else {
    return t("userRsvp.scheduler.daysBefore", { days: Math.abs(daysDiff) });
  }
};

/**
 * Get offset description for a date relative to wedding date
 * Returns object with days count and type (before/after/same)
 * Both dates are normalized to UTC midnight for accurate comparison
 */
export const getWeddingDateOffset = (
  scheduledTime: Date,
  weddingDate: Date
) => {
  // Normalize both dates to UTC midnight for accurate day comparison
  const normalizedScheduledTime = normalizeToUTCMidnight(scheduledTime);
  const normalizedWeddingDate = normalizeToUTCMidnight(weddingDate);

  const daysDiff = differenceInDays(
    normalizedScheduledTime,
    normalizedWeddingDate
  );

  return {
    days: Math.abs(daysDiff),
    type: daysDiff === 0 ? "same" : daysDiff > 0 ? "after" : "before",
    isWeddingDay: daysDiff === 0,
  };
};
