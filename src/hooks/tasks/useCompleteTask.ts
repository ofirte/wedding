import { useUpdateTask } from "./useUpdateTask";

/**
 * Hook to mark a task as complete or incomplete
 * @returns A function to update a task's completion status
 */
export const useCompleteTask = () => {
  const { mutate, mutateAsync, ...updateInfo } = useUpdateTask();

  return {
    ...updateInfo,
    mutate: (id: string, completed: boolean, weddingId?: string) =>
      mutate({
        id,
        data: {
          completed,
          status: completed ? "completed" : "not_started",
          completedAt: completed ? new Date().toISOString() : undefined,
        },
        weddingId,
      }),
    mutateAsync: (id: string, completed: boolean, weddingId?: string) =>
      mutateAsync({
        id,
        data: {
          completed,
          status: completed ? "completed" : "not_started",
          completedAt: completed ? new Date().toISOString() : undefined,
        },
        weddingId,
      }),
  };
};
