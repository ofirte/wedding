import { differenceInDays } from "date-fns";

/**
 * Calculates the offset of a given date relative to the wedding date
 * and returns a human-readable description
 */
export const getWeddingDayOffset = (
  scheduledTime: Date,
  weddingDate: Date,
  t: (key: string, options?: any) => string
): string => {
  const daysDiff = differenceInDays(
    new Date(scheduledTime),
    new Date(weddingDate)
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
 */
export const getWeddingDateOffset = (
  scheduledTime: Date,
  weddingDate: Date
) => {
  const daysDiff = differenceInDays(
    new Date(scheduledTime),
    new Date(weddingDate)
  );

  return {
    days: Math.abs(daysDiff),
    type: daysDiff === 0 ? "same" : daysDiff > 0 ? "after" : "before",
    isWeddingDay: daysDiff === 0,
  };
};
