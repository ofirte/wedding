import { GetTemplateApprovalStatusResponse } from "../../../shared/api";
import { getApprovalStatus } from "../../api/rsvp/templateApi";
import { useWeddingQuery } from "../common";


export const useApprovalStatus = (templateSid?: string) => {
  return useWeddingQuery<GetTemplateApprovalStatusResponse>({
    queryKey: ["approval-status", templateSid],
    queryFn: () => {
      if (!templateSid) {
        throw new Error("Template SID is required to fetch approval status");
      }
      return getApprovalStatus(templateSid);
    },
    options: {
      enabled: !!templateSid, // Only run query if templateSid is provided
      staleTime: 5 * 60 * 1000, // 5 minutes - approval status doesn't change frequently
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
    },
  });
};
