import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskTemplate } from "../../api/taskTemplates/taskTemplatesApi";
import { TaskTemplate } from "@wedding-plan/types";

interface CreateTaskTemplateVariables {
  template: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "createdBy">;
}

/**
 * Hook to create a new task template
 * @returns Mutation result object for creating task templates
 */
export const useCreateTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateTaskTemplateVariables>({
    mutationFn: async ({ template }) => {
      const docRef = await createTaskTemplate(template);
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTemplates"] });
    },
  });
};
