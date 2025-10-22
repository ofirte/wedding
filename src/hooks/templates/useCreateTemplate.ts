import { useParams } from "react-router";
import { useCreateTemplate as useCreateWeddingTemplate } from "../rsvp";
import { useCreateGlobalTemplate } from "../globalTemplates";

/**
 * Context-aware hook that returns wedding template creation or global template creation
 * based on the current route context (admin vs wedding)
 */
export const useCreateTemplate = () => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call both hooks unconditionally (Rules of Hooks)
  const weddingCreateResult = useCreateWeddingTemplate();
  const globalCreateResult = useCreateGlobalTemplate();

  // Return the appropriate result based on context
  return isAdminContext ? globalCreateResult : weddingCreateResult;
};
