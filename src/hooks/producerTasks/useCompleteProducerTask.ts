import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeProducerTask } from "../../api/producerTasks/producerTasksApi";

/**
 * Hook to mark a producer task as complete or incomplete
 * @returns Mutation result object for completing producer tasks
 */
export const useCompleteProducerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completeProducerTask(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producer-tasks"] });
    },
  });
};
