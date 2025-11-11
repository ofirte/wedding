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
    options: {
      refetchOnWindowFocus: false, // Using real-time updates through onSnapshot
      staleTime: 30000, // Consider data fresh for 30 seconds
      gcTime: 300000, // Keep in cache for 5 minutes
    },
  });
};

export default useAllWeddingsTasks;
