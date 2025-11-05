import { useParams } from "react-router";
import { useSubmitTemplateApproval as useSubmitWeddingTemplateApproval } from "../rsvp";
import { useSubmitGlobalTemplateApproval } from "../globalTemplates";

/**
 * Context-aware admin template approval submission hook
 * Uses global template API for admin context and wedding template API for wedding context
 */
export const useSubmitAdminTemplateApproval = () => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call both hooks unconditionally (Rules of Hooks)
  const weddingSubmitResult = useSubmitWeddingTemplateApproval();
  const globalSubmitResult = useSubmitGlobalTemplateApproval();

  // Return the appropriate result based on context
  return isAdminContext ? globalSubmitResult : weddingSubmitResult;
};

// Export with original name for backward compatibility
export const useSubmitTemplateApproval = useSubmitAdminTemplateApproval;
