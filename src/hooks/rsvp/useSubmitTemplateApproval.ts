import { useWeddingMutation } from "../common";
import { submitTemplateForApproval } from "../../api/rsvp/templateApi";
import {
  SubmitTemplateApprovalRequest,
  TemplateApprovalResponse,
} from "@wedding-plan/types";

interface SubmitApprovalVariables {
  templateSid: string;
  approvalRequest: SubmitTemplateApprovalRequest;
}

export const useSubmitTemplateApproval = () => {
  return useWeddingMutation<TemplateApprovalResponse, SubmitApprovalVariables>({
    mutationFn: async (variables: SubmitApprovalVariables) => {
      return submitTemplateForApproval(
        variables.templateSid,
        variables.approvalRequest
      );
    },
    options: {
      onError: (error, variables) => {
        console.error(
          `Failed to submit template ${variables.templateSid} for approval:`,
          error
        );
      },
    },
  });
};
