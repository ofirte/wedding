import { useParams } from "react-router";
import { useApprovalStatus as useWeddingApprovalStatus } from "../rsvp";
import { useGlobalApprovalStatus } from "../globalTemplates";

/**
 * Context-aware admin approval status hook
 * Uses global template API for admin context and wedding template API for wedding context
 */
export const useAdminApprovalStatus = (templateSid?: string) => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call both hooks unconditionally (Rules of Hooks)
  const weddingApprovalResult = useWeddingApprovalStatus(templateSid);
  const globalApprovalResult = useGlobalApprovalStatus(templateSid);

  // Return the appropriate result based on context
  return isAdminContext ? globalApprovalResult : weddingApprovalResult;
};

// Export with original name for backward compatibility
export const useApprovalStatus = useAdminApprovalStatus;
