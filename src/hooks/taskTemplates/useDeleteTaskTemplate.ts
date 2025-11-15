import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskTemplate } from "../../api/taskTemplates/taskTemplatesApi";

interface DeleteTaskTemplateVariables {
  id: string;
}

/**
 * Hook to delete a task template
 * @returns Mutation result object for deleting task templates
 */
export const useDeleteTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteTaskTemplateVariables>({
    mutationFn: ({ id }) => deleteTaskTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTemplates"] });
    },
  });
};
