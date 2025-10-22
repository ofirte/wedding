import { useParams } from "react-router";
import { useDeleteTemplate as useDeleteWeddingTemplate } from "../rsvp";
import { useDeleteGlobalTemplate } from "../globalTemplates";

/**
 * Context-aware hook that returns wedding template deletion or global template deletion
 * based on the current route context (admin vs wedding)
 */
export const useDeleteTemplate = () => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call both hooks unconditionally (Rules of Hooks)
  const weddingDeleteResult = useDeleteWeddingTemplate();
  const globalDeleteResult = useDeleteGlobalTemplate();

  // Return the appropriate result based on context
  return isAdminContext ? globalDeleteResult : weddingDeleteResult;
};
