import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGlobalTemplate } from "../../api/globalTemplates";
import { CreateMessageTemplateRequest, Template } from "@wedding-plan/types";

interface CreateGlobalTemplateVariables {
  templateData: CreateMessageTemplateRequest;
  userId?: string;
}

/**
 * Hook to create a new global Twilio template and save it to Firebase
 * @returns Mutation result object for creating global templates
 */
export const useCreateGlobalTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, CreateGlobalTemplateVariables>({
    mutationFn: ({ templateData, userId }) =>
      createGlobalTemplate(templateData, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalTemplates"] });
    },
  });
};
