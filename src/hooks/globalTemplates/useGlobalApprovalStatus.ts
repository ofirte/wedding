import { useQuery } from "@tanstack/react-query";
import { getGlobalApprovalStatus } from "../../api/globalTemplates";
import { GetTemplateApprovalStatusResponse } from "@wedding-plan/types";

/**
 * Hook to get the approval status of a global template
 * @param templateSid The Twilio template SID
 * @returns Query result with approval status data
 */
export const useGlobalApprovalStatus = (templateSid?: string) => {
  return useQuery<GetTemplateApprovalStatusResponse, Error>({
    queryKey: ["globalTemplateApprovalStatus", templateSid],
    queryFn: () => getGlobalApprovalStatus(templateSid!),
    enabled: !!templateSid,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};
