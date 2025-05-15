import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../../api/tasks/tasksApi";
import { Task } from "./useTasks";

/**
 * Hook to update a task
 * @returns Mutation result object for updating tasks
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
