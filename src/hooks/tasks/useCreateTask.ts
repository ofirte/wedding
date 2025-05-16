import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../api/tasks/tasksApi";
import { Task } from "./useTasks";

import { useWeddingMutation } from "../common";

/**
 * Hook to create a task
 * @returns Mutation result object for creating tasks
 */
export const useCreateTask = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (task: Omit<Task, "id">) => createTask(task),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
