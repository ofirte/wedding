import {  UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "../../api/tasks/tasksApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete a task
 * @returns Mutation result object for deleting tasks
 */
export const useDeleteTask = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (id: string) => deleteTask(id),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        options?.onSuccess?.(data, variables, context); 
      },
    },
    ...options,
  });
};
