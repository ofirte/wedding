import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskTemplate } from "../../api/taskTemplates/taskTemplatesApi";
import { TaskTemplate } from "@wedding-plan/types";

interface UpdateTaskTemplateVariables {
  id: string;
  data: Partial<TaskTemplate>;
}

/**
 * Hook to update an existing task template
 * @returns Mutation result object for updating task templates
 */
export const useUpdateTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTaskTemplateVariables>({
    mutationFn: ({ id, data }) => updateTaskTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTemplates"] });
    },
  });
};
