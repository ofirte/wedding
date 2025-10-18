import { fetchTasks } from "../../api/tasks/tasksApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch tasks data
 * @returns Query result object containing tasks data and query state
 */
const useTasks = () => {
  // Fetch tasks using TanStack Query
  return useWeddingQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    options: { refetchOnWindowFocus: false }, // Using real-time updates through onSnapshot
  });
};

export default useTasks;
