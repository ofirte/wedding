import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProducerTask } from "../../api/producerTasks/producerTasksApi";
import { ProducerTask } from "@wedding-plan/types";

/**
 * Hook to create a producer task
 * @returns Mutation result object for creating producer tasks
 */
export const useCreateProducerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      task: Omit<ProducerTask, "id" | "producerIds" | "createdBy" | "createdAt">
    ) => createProducerTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producer-tasks"] });
    },
  });
};
