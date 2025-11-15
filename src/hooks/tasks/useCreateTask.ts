import { useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../api/tasks/tasksApi";

import { useWeddingMutation } from "../common";
import { Task } from "@wedding-plan/types";

/**
 * Hook to create a task
 * @returns Mutation result object for creating tasks
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      { task }: { task: Omit<Task, "id">; weddingId?: string },
      weddingId?: string
    ) => createTask(task, weddingId),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-weddings-tasks"] });
      },
    },
  });
};
