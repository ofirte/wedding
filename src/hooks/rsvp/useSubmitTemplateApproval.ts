import { useWeddingMutation } from "../common";
import {
  submitTemplateForApproval,
  ApprovalRequest,
  ApprovalResponse,
} from "../../api/rsvp/templateApi";

interface SubmitApprovalVariables {
  templateSid: string;
  approvalRequest: ApprovalRequest;
}

export const useSubmitTemplateApproval = () => {
  return useWeddingMutation<ApprovalResponse, SubmitApprovalVariables>({
    mutationFn: async (variables: SubmitApprovalVariables) => {
      return submitTemplateForApproval(
        variables.templateSid,
        variables.approvalRequest
      );
    },
    options: {
      onSuccess: (data, variables) => {
        console.log(
          `Template ${variables.templateSid} submitted for approval successfully:`,
          data
        );
      },
      onError: (error, variables) => {
        console.error(
          `Failed to submit template ${variables.templateSid} for approval:`,
          error
        );
      },
    },
  });
};
