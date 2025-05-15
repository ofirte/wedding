import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "../../api/tasks/tasksApi";

/**
 * Hook to delete a task
 * @returns Mutation result object for deleting tasks
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
