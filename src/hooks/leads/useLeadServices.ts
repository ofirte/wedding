import { useMemo } from "react";
import { Lead } from "@wedding-plan/types";

/**
 * Hook to get unique service values from leads for autocomplete
 * @param leads - Array of all leads
 * @returns Array of unique service options from historical data only
 */
export const useLeadServices = (leads: Lead[]): string[] => {
  return useMemo(() => {
    // Extract unique service values from existing leads
    const historicalServices = leads
      .map((lead) => lead.service)
      .filter((service): service is string => !!service && service.trim().length > 0)
      .filter((service, index, self) => self.indexOf(service) === index) // unique only
      .sort();

    return historicalServices;
  }, [leads]);
};
