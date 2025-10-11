import {  useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "../../api/tasks/tasksApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete a task
 * @returns Mutation result object for deleting tasks
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: deleteTask,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    },
  });
};
