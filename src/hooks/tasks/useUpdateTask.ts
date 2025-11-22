import { useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../../api/tasks/tasksApi";
import { Task } from "@wedding-plan/types";
import { useWeddingMutation, useSnackbar } from "../common";
import { useTranslation } from "../../localization/LocalizationContext";

/**
 * Hook to update a task
 * @returns Mutation result object for updating tasks
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  return useWeddingMutation({
    mutationFn: (
      { id, data }: { id: string; data: Partial<Task>; weddingId?: string },
      weddingId?: string
    ) => updateTask(id, data, weddingId),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-weddings-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        showSnackbar(t('tasks.messages.updateSuccess'), 'success');
      },
      onError: () => {
        showSnackbar(t('tasks.messages.updateError'), 'error');
      },
    },
  });
};
