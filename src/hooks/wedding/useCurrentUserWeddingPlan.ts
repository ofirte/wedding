import { useWeddingDetails } from "../wedding/useWeddingDetails";
import { WeddingPlans, WeddingPlan } from "@wedding-plan/types";

interface UseCurrentUserWeddingPlanOptions {
  /** Poll interval in ms. Automatically stops when plan becomes PAID. */
  refetchUntilPaid?: number;
}

interface UseCurrentUserWeddingPlanResult {
  plan: WeddingPlan;
  isLoading: boolean;
  isPaid: boolean;
}

/**
 * Hook to get the wedding's plan
 * Note: Plan is now stored at wedding level, not per member.
 * All members of a wedding share the same plan.
 * @returns The wedding's plan (paid or free), loading state, and isPaid flag
 */
export const useCurrentUserWeddingPlan = (
  options?: UseCurrentUserWeddingPlanOptions
): UseCurrentUserWeddingPlanResult => {
  const { data: wedding, isLoading } = useWeddingDetails(undefined, {
    refetchInterval: options?.refetchUntilPaid
      ? (query) =>
          query.state.data?.plan === WeddingPlans.PAID
            ? false
            : options.refetchUntilPaid
      : undefined,
  });

  const plan = wedding?.plan || WeddingPlans.FREE;

  return {
    plan,
    isLoading,
    isPaid: plan === WeddingPlans.PAID,
  };
};
