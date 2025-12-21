import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProducerTask } from "../../api/producerTasks/producerTasksApi";
import { ProducerTask } from "@wedding-plan/types";

/**
 * Hook to update a producer task with optimistic updates
 * Updates the UI immediately while the server request happens in the background
 * @returns Mutation result object for updating producer tasks
 */
export const useUpdateProducerTaskOptimistic = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; data: Partial<ProducerTask> },
    { previousTasks: ProducerTask[] | undefined }
  >({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProducerTask> }) =>
      updateProducerTask(id, data),
    // Optimistic update - apply changes immediately
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["producer-tasks"] });

      // Snapshot current value for rollback
      const previousTasks = queryClient.getQueryData<ProducerTask[]>([
        "producer-tasks",
      ]);

      // Optimistically update the cache
      queryClient.setQueryData<ProducerTask[]>(["producer-tasks"], (old) =>
        old?.map((task) =>
          task.id === id ? { ...task, ...data } : task
        )
      );

      return { previousTasks };
    },
    // Note: No invalidateQueries here - optimistic update keeps UI in sync
    // and invalidation would interfere with Tab navigation between cells
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["producer-tasks"], context.previousTasks);
      }
    },
  });
};
