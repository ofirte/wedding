import { createCollectionAPI } from "../weddingFirebaseHelpers";
import { Task } from "@wedding-plan/types";

// Create all CRUD operations for tasks (DRY approach)
const tasksAPI = createCollectionAPI<Task>("tasks");

// Export the standard CRUD operations
export const fetchTasks = tasksAPI.fetchAll;
export const subscribeToTasks = tasksAPI.subscribe;
export const fetchTask = tasksAPI.fetchById;
export const updateTask = tasksAPI.update;
export const deleteTask = tasksAPI.delete;
export const bulkUpdateTasks = tasksAPI.bulkUpdate;
export const bulkDeleteTasks = tasksAPI.bulkDelete;

// Custom create function that adds createdAt timestamp
export const createTask = async (
  task: Omit<Task, "id">,
  weddingId?: string
) => {
  return tasksAPI.create(
    {
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
    },
    weddingId
  );
};
