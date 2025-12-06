import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProducerTask } from "../../api/producerTasks/producerTasksApi";

/**
 * Hook to delete a producer task
 * @returns Mutation result object for deleting producer tasks
 */
export const useDeleteProducerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProducerTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producer-tasks"] });
    },
  });
};
