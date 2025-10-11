import { useQueryClient } from "@tanstack/react-query";
import {
  createTemplate,
  CreateTemplateRequest,
  CreateTemplateResponse,
} from "../../api/rsvp/templateApi";
import { useWeddingMutation } from "../common";

interface CreateTemplateVariables {
  templateData: CreateTemplateRequest;
  userId?: string;
}

/**
 * Hook to create a new Twilio template and save it to Firebase
 * @returns Mutation result object for creating templates
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<CreateTemplateResponse, CreateTemplateVariables>({
    mutationFn: ({ templateData, userId }, weddingId) =>
      createTemplate(templateData, weddingId, userId),
    options: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        console.log(`Template created successfully: ${data.sid}`);
      },
    },
  });
};
