import { useWeddingDetails } from "../wedding/useWeddingDetails";
import { WeddingPlans, WeddingPlan } from "@wedding-plan/types";

/**
 * Hook to get the wedding's plan
 * Note: Plan is now stored at wedding level, not per member.
 * All members of a wedding share the same plan.
 * @returns The wedding's plan (paid or free)
 */
export const useCurrentUserWeddingPlan = (): WeddingPlan => {
  const { data: wedding } = useWeddingDetails();

  // Get the plan from the wedding level (not from individual members)
  return wedding?.plan || WeddingPlans.FREE;
};
