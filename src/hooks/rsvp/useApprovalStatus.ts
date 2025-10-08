import { useWeddingQuery } from "../common";
import {
  getApprovalStatus,
  ApprovalStatusResponse,
} from "../../api/rsvp/templateApi";

export const useApprovalStatus = (templateSid?: string) => {
  return useWeddingQuery<ApprovalStatusResponse>({
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
