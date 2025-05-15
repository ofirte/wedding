// filepath: /Users/ofirtene/Projects/wedding-plan/src/hooks/tasks/useTasks.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../../api/tasks/tasksApi";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  assignedTo?: string;
}

/**
 * Hook to fetch tasks data
 * @returns Query result object containing tasks data and query state
 */
const useTasks = () => {
  // Fetch tasks using TanStack Query
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    refetchOnWindowFocus: false, // Using real-time updates through onSnapshot
  });
};

export default useTasks;
