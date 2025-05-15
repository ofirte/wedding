import { useUpdateTask } from "./useUpdateTask";

export const useAssignTask = () => {
  const { mutate: updateTask, ...updateInfo } = useUpdateTask();

  return {
    ...updateInfo,
    mutate: (id: string, person: string) =>
      updateTask({ id, data: { assignedTo: person } }),
  };
};
