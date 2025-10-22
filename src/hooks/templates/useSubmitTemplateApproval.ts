import { useParams } from "react-router";
import { useSubmitTemplateApproval as useSubmitWeddingTemplateApproval } from "../rsvp";

/**
 * Context-aware hook that returns wedding template approval submission or null for admin context
 * (Global templates don't have approval workflow yet)
 */
export const useSubmitTemplateApproval = () => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call wedding hook unconditionally (Rules of Hooks)
  const weddingSubmitResult = useSubmitWeddingTemplateApproval();

  // Mock result for admin context
  const mockResult = {
    mutate: () => {},
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => {},
    data: null,
  };

  // Return the appropriate result based on context
  return isAdminContext ? mockResult : weddingSubmitResult;
};
