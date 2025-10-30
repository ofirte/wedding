import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitGlobalTemplateForApproval } from "../../api/globalTemplates";
import {
  SubmitTemplateApprovalRequest,
  TemplateApprovalResponse,
} from "@wedding-plan/types";

interface SubmitGlobalApprovalVariables {
  templateSid: string;
  approvalRequest: SubmitTemplateApprovalRequest;
}

/**
 * Hook to submit a global template for WhatsApp approval
 * @returns Mutation result object for submitting global template approval
 */
export const useSubmitGlobalTemplateApproval = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TemplateApprovalResponse,
    Error,
    SubmitGlobalApprovalVariables
  >({
    mutationFn: async (variables: SubmitGlobalApprovalVariables) => {
      return submitGlobalTemplateForApproval(
        variables.templateSid,
        variables.approvalRequest
      );
    },
    onSuccess: () => {
      // Invalidate global templates query to refresh approval status
      queryClient.invalidateQueries({ queryKey: ["globalTemplates"] });
    },
    onError: (error, variables) => {
      console.error(
        `Failed to submit global template ${variables.templateSid} for approval:`,
        error
      );
    },
  });
};
