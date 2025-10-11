import { useEffect } from "react";
import { useWeddingQuery } from "../common";
import { getWeddingTemplates } from "../../api/rsvp/templateApi";
import { useApprovalStatusSync } from "./useApprovalStatusSync";

interface UseTemplatesOptions {
  syncApprovalStatus?: boolean; // Whether to sync approval statuses after loading
}

/**
 * Hook to fetch combined templates from both Twilio and Firebase
 * Returns only templates that exist in both sources (intersection)
 * @param options Configuration options
 * @returns Query result object for combined templates
 */
export const useTemplates = (options: UseTemplatesOptions = {}) => {
  const { syncApprovalStatus = false } = options;
  const { syncApprovalStatuses } = useApprovalStatusSync();

  const query = useWeddingQuery({
    queryKey: ["templates"],
    queryFn: (weddingId) => getWeddingTemplates(weddingId),
  });

  // Background sync approval statuses if enabled and data is loaded
  useEffect(() => {
    if (
      syncApprovalStatus &&
      query.isSuccess &&
      query.data?.templates &&
      query.data.templates.length > 0
    ) {
      // Run sync in background, don't wait for it
      syncApprovalStatuses(query.data.templates).catch((error) => {
        console.warn("Background approval status sync failed:", error);
      });
    }
  }, [
    syncApprovalStatus,
    query.isSuccess,
    query.data?.templates,
    syncApprovalStatuses,
  ]);

  return query;
};
