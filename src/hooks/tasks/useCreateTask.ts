import { useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../api/tasks/tasksApi";
import { Task } from "./useTasks";

import { useWeddingMutation } from "../common";

/**
 * Hook to create a task
 * @returns Mutation result object for creating tasks
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (task: Omit<Task, "id">) => createTask(task),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    },
  });
};
