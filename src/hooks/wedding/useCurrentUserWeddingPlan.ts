import { useAuth } from "../auth/AuthContext";
import { useWeddingDetails } from "../wedding/useWeddingDetails";
import { WeddingPlans, WeddingPlan } from "@wedding-plan/types";

/**
 * Hook to get the current user's wedding plan
 * @returns The current user's wedding plan (free or paid)
 */
export const useCurrentUserWeddingPlan = (): WeddingPlan => {
  const { currentUser } = useAuth();
  const { data: wedding } = useWeddingDetails();

  // Get the current user's plan from the wedding members
  const userPlan = wedding?.members?.[currentUser?.uid || ""]?.plan;

  // Default to FREE if no plan is found
  return userPlan || WeddingPlans.FREE;
};
