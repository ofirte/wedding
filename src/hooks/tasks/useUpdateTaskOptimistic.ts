import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { updateTask } from "../../api/tasks/tasksApi";
import { Task } from "@wedding-plan/types";
import { useWeddingMutation } from "../common";

interface UpdateTaskOptimisticVariables {
  id: string;
  data: Partial<Task>;
  weddingId?: string; // Optional - falls back to URL param if not provided
}

interface UpdateTaskContext {
  previousTasks: Task[] | undefined;
  weddingId: string | undefined;
}

/**
 * Hook to update a task with optimistic updates
 * Updates the UI immediately while the server request happens in the background
 * Supports both URL-based weddingId (TaskManager) and explicit weddingId (TasksManagementPage)
 * @returns Mutation result object for updating tasks
 */
export const useUpdateTaskOptimistic = () => {
  const queryClient = useQueryClient();
  const { weddingId: urlWeddingId } = useParams<{ weddingId: string }>();

  return useWeddingMutation<
    void,
    UpdateTaskOptimisticVariables,
    Error,
    UpdateTaskContext
  >({
    mutationFn: (
      { id, data }: UpdateTaskOptimisticVariables,
      weddingId?: string
    ) => updateTask(id, data, weddingId),
    options: {
      // Optimistic update - apply changes immediately
      onMutate: async ({ id, data, weddingId: explicitWeddingId }) => {
        // Use explicit weddingId if provided, otherwise fall back to URL param
        const effectiveWeddingId = explicitWeddingId || urlWeddingId;

        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ["tasks", effectiveWeddingId] });

        // Snapshot current value for rollback
        const previousTasks = queryClient.getQueryData<Task[]>([
          "tasks",
          effectiveWeddingId,
        ]);

        // Optimistically update the cache
        queryClient.setQueryData<Task[]>(["tasks", effectiveWeddingId], (old) =>
          old?.map((task) =>
            task.id === id ? { ...task, ...data } : task
          )
        );

        return { previousTasks, weddingId: effectiveWeddingId };
      },
      // Note: No invalidateQueries here - optimistic update keeps UI in sync
      // and invalidation would interfere with Tab navigation between cells
      onError: (_err, _variables, context) => {
        if (context?.previousTasks && context?.weddingId) {
          queryClient.setQueryData(
            ["tasks", context.weddingId],
            context.previousTasks
          );
        }
      },
    },
  });
};
