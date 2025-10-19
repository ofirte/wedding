import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getApprovalStatus,
  updateTemplateApprovalStatus,
  shouldSyncApprovalStatus,
} from "../../api/rsvp/templateApi";
import { useParams } from "react-router";

interface TemplateWithSid {
  sid: string;
  approvalStatus?: string;
}

/**
 * Hook to batch sync approval statuses for multiple templates
 * Only fetches from Twilio API if template has been submitted (not pending)
 * Updates Firebase if status has changed
 */
export const useApprovalStatusSync = () => {
  const queryClient = useQueryClient();
  const { weddingId } = useParams<{ weddingId: string }>();

  const syncApprovalStatuses = useCallback(
    async (templates: TemplateWithSid[]) => {
      // Only sync templates that might have status updates from WhatsApp
      const templatesToSync = templates.filter((template) =>
        shouldSyncApprovalStatus(template.approvalStatus)
      );
      console.log(templatesToSync);
      if (templatesToSync.length === 0) {
        return;
      }
      console.log(
        `Syncing approval statuses for ${templatesToSync} templates...`
      );
      // Batch process with delay to avoid rate limiting
      const syncResults = await Promise.allSettled(
        templatesToSync.map(async (template, index) => {
          // Add small delay between requests to be respectful to API
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          try {
            const approvalData = await getApprovalStatus(template.sid);
            console.log(approvalData);
            const twilioStatus = approvalData.approvalData.whatsapp?.status;
            console.log(twilioStatus);
            console.log(template.approvalStatus);
            // If Twilio status differs from Firebase, update Firebase
            if (twilioStatus && twilioStatus !== template.approvalStatus) {
              console.log(
                `Syncing approval status for template ${template.sid}: ${template.approvalStatus} → ${twilioStatus}`
              );
              console.log(weddingId);
              console.log(template.sid);
              console.log(twilioStatus);
              await updateTemplateApprovalStatus(
                template.sid,
                twilioStatus,
                weddingId
              );

              // Invalidate queries to refresh UI
              queryClient.invalidateQueries({ queryKey: ["templates"] });
              queryClient.invalidateQueries({
                queryKey: ["approval-status", template.sid],
              });

              return {
                templateSid: template.sid,
                oldStatus: template.approvalStatus,
                newStatus: twilioStatus,
                updated: true,
              };
            }

            return {
              templateSid: template.sid,
              status: twilioStatus,
              updated: false,
            };
          } catch (error) {
            console.warn(
              `Failed to sync approval status for template ${template.sid}:`,
              error
            );
            return {
              templateSid: template.sid,
              error: error instanceof Error ? error.message : "Unknown error",
              updated: false,
            };
          }
        })
      );

      // Log summary of sync results
      const successful = syncResults.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const updated = syncResults.filter(
        (result) => result.status === "fulfilled" && result.value.updated
      ).length;

      if (updated > 0) {
        console.log(
          `Approval status sync completed: ${updated}/${successful} templates updated`
        );
      }

      return syncResults;
    },
    [queryClient]
  );

  return { syncApprovalStatuses };
};
