import { useQuery } from "@tanstack/react-query";
import { fetchProducerTasks } from "../../api/producerTasks/producerTasksApi";

/**
 * Hook to fetch all producer tasks for the current user
 * @returns Query result object containing producer tasks data and query state
 */
export const useProducerTasks = () => {
  return useQuery({
    queryKey: ["producer-tasks"],
    queryFn: fetchProducerTasks,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });
};
