import { fetchAllTasks } from "src/api/tasks/allTasksApi";
import { useWeddingsQuery } from "../common/useWeddingsQuery";

/**
 * Hook to fetch tasks data
 * @returns Query result object containing tasks data and query state
 */
const useAllWeddingsTasks = () => {
  return useWeddingsQuery({
    queryKey: ["all-weddings-tasks"],
    queryFn: fetchAllTasks,
    options: { refetchOnWindowFocus: false }, // Using real-time updates through onSnapshot
  });
};

export default useAllWeddingsTasks;
