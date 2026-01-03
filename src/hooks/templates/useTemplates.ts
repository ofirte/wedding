import { useParams } from "react-router";
import { useWeddingTemplates } from "./useWeddingTemplates";
import { useGlobalTemplates } from "../globalTemplates";

/**
 * Context-aware hook that returns wedding templates or global templates
 * based on the current route context (admin vs wedding)
 */
export const useTemplates = (options?: any) => {
  const params = useParams();
  const isAdminContext = !params.weddingId; // If no weddingId param, we're in admin context

  // Call both hooks unconditionally (Rules of Hooks)
  const weddingTemplatesResult = useWeddingTemplates(options);
  const globalTemplatesResult = useGlobalTemplates();

  // Return the appropriate result based on context
  return isAdminContext ? globalTemplatesResult : weddingTemplatesResult;
};
