import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyTemplateToWedding } from "../../api/taskTemplates/taskTemplatesApi";

interface ApplyTaskTemplateVariables {
  templateId: string;
  weddingId: string;
}

/**
 * Hook to apply a task template to a wedding
 * Creates all tasks from the template in the specified wedding
 * @returns Mutation result object for applying task templates
 */
export const useApplyTaskTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ApplyTaskTemplateVariables>({
    mutationFn: ({ templateId, weddingId }) =>
      applyTemplateToWedding(templateId, weddingId),
    onSuccess: (_, { weddingId }) => {
      // Invalidate tasks for the specific wedding
      queryClient.invalidateQueries({ queryKey: ["tasks", weddingId] });
      // Invalidate wedding details (for appliedTaskTemplates tracking)
      queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] });
      // Invalidate all tasks view (multi-wedding)
      queryClient.invalidateQueries({ queryKey: ["all-weddings-tasks"] });
    },
  });
};
