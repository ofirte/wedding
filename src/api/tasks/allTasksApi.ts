import { Task } from "@wedding-plan/types";
import { createMultiWeddingCollectionAPI } from "../multiWeddingFirebaseHelpers";

// Create all CRUD operations for tasks (DRY approach)
const tasksAPI = createMultiWeddingCollectionAPI<Task & { weddingId: string }>("tasks");

// Export the standard CRUD operations
export const subscribeToTasks = tasksAPI.subscribe;
export const fetchAllTasks = tasksAPI.fetchAll;
export const fetchTasks = tasksAPI.fetchByFilter;


