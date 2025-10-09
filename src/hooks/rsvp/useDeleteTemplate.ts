import { useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "../../api/rsvp/templateApi";
import { useWeddingMutation } from "../common";

interface DeleteTemplateVariables {
  templateSid: string;
  firebaseId: string;
}

/**
 * Hook to delete a template from both Twilio and Firebase
 * @returns Mutation result object for deleting templates
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, DeleteTemplateVariables>({
    mutationFn: ({ templateSid, firebaseId }, weddingId) =>
      deleteTemplate(templateSid, firebaseId, weddingId),
    options: {
      onSuccess: (_, variables) => {
        // Invalidate templates query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["templates"] });

        console.log(`Template ${variables.templateSid} deleted successfully`);
      },
      onError: (error, variables) => {
        console.error(
          `Failed to delete template ${variables.templateSid}:`,
          error
        );
      },
    },
  });
};
