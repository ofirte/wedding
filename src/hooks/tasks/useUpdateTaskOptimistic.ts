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
  previousAllWeddingsTasks: Task[] | undefined;
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

        // Cancel outgoing refetches for both query key prefixes
        await queryClient.cancelQueries({ queryKey: ["tasks"] });
        await queryClient.cancelQueries({ queryKey: ["all-weddings-tasks"] });

        // Snapshot current values for rollback using prefix matching
        const previousTasksEntries = queryClient.getQueriesData<Task[]>({
          queryKey: ["tasks"],
        });
        const previousAllWeddingsTasksEntries = queryClient.getQueriesData<Task[]>({
          queryKey: ["all-weddings-tasks"],
        });

        // Optimistically update all matching caches using prefix matching
        queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) =>
          old?.map((task) =>
            task.id === id ? { ...task, ...data } : task
          )
        );
        queryClient.setQueriesData<Task[]>({ queryKey: ["all-weddings-tasks"] }, (old) =>
          old?.map((task) =>
            task.id === id ? { ...task, ...data } : task
          )
        );

        return {
          previousTasks: previousTasksEntries[0]?.[1],
          previousAllWeddingsTasks: previousAllWeddingsTasksEntries[0]?.[1],
          weddingId: effectiveWeddingId,
        };
      },
      // Note: No invalidateQueries here - optimistic update keeps UI in sync
      // and invalidation would interfere with Tab navigation between cells
      onError: (_err, _variables, context) => {
        // Rollback both caches on error using prefix matching
        if (context?.previousTasks) {
          queryClient.setQueriesData<Task[]>(
            { queryKey: ["tasks"] },
            context.previousTasks
          );
        }
        if (context?.previousAllWeddingsTasks) {
          queryClient.setQueriesData<Task[]>(
            { queryKey: ["all-weddings-tasks"] },
            context.previousAllWeddingsTasks
          );
        }
      },
    },
  });
};
