import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGlobalTemplate } from "../../api/globalTemplates";

interface DeleteGlobalTemplateVariables {
  templateSid: string;
  firebaseId: string;
}

/**
 * Hook to delete a global template from both Twilio and Firebase
 * @returns Mutation result object for deleting global templates
 */
export const useDeleteGlobalTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteGlobalTemplateVariables>({
    mutationFn: ({ templateSid, firebaseId }) =>
      deleteGlobalTemplate(templateSid, firebaseId),
    onSuccess: (_, variables) => {
      // Invalidate global templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["globalTemplates"] });

      console.log(
        `Global template ${variables.templateSid} deleted successfully`
      );
    },
    onError: (error, variables) => {
      console.error(
        `Failed to delete global template ${variables.templateSid}:`,
        error
      );
    },
  });
};
