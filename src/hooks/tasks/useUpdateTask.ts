import { useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../../api/tasks/tasksApi";
import { Task } from "@wedding-plan/types";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a task
 * @returns Mutation result object for updating tasks
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      { id, data }: { id: string; data: Partial<Task>; weddingId?: string },
      weddingId?: string
    ) => updateTask(id, data, weddingId),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-weddings-tasks"] });
      },
    },
  });
};
