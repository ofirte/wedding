import { useParams } from "react-router";
import { useApprovalStatus as useWeddingApprovalStatus } from "../rsvp";

/**
 * Context-aware hook that returns wedding approval status or null for admin context
 * (Global templates don't have approval workflow yet)
 */
export const useApprovalStatus = (templateSid?: string) => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call wedding hook unconditionally (Rules of Hooks)
  const weddingApprovalResult = useWeddingApprovalStatus(templateSid);

  // Mock result for admin context
  const mockResult = {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };

  // Return the appropriate result based on context
  return isAdminContext ? mockResult : weddingApprovalResult;
};
