import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../../api/tasks/tasksApi";
import { Task } from "./useTasks";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a task
 * @returns Mutation result object for updating tasks
 */
export const useUpdateTask = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
