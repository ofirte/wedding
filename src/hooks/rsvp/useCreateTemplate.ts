import { useQueryClient } from "@tanstack/react-query";
import { createTemplate } from "../../api/rsvp/templateApi";
import { useWeddingMutation } from "../common";
import { CreateMessageTemplateRequest, Template } from "../../../shared";

interface CreateTemplateVariables {
  templateData: CreateMessageTemplateRequest;
  userId?: string;
}

/**
 * Hook to create a new Twilio template and save it to Firebase
 * @returns Mutation result object for creating templates
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<Template, CreateTemplateVariables>({
    mutationFn: ({ templateData, userId }, weddingId) =>
      createTemplate(templateData, weddingId, userId),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["templates"] });
      },
    },
  });
};
