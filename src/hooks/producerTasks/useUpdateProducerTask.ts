import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProducerTask } from "../../api/producerTasks/producerTasksApi";
import { ProducerTask } from "@wedding-plan/types";

/**
 * Hook to update a producer task
 * @returns Mutation result object for updating producer tasks
 */
export const useUpdateProducerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProducerTask> }) =>
      updateProducerTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producer-tasks"] });
    },
  });
};
