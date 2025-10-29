import { useMemo } from "react";
import { useSendAutomations } from "./useSendAutomations";

/**
 * Hook to check if all automations are approved/active
 * @returns boolean indicating if all automations are approved
 */
export const useAllAutomationsApproved = () => {
  const { data: automations = [], isLoading } = useSendAutomations();

  const allApproved = useMemo(() => {
    if (automations.length === 0) return false;
    return automations.every((automation) => automation.isActive);
  }, [automations]);

  return {
    allApproved,
    isLoading,
    totalAutomations: automations.length,
    approvedCount: automations.filter((auto) => auto.isActive).length,
  };
};
