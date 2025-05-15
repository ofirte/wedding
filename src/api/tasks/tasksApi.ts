import { weddingFirebase } from "../weddingFirebaseHelpers";
import { Task } from "../../hooks/tasks/useTasks";

/**
 * Fetches all tasks from Firebase for the current user's wedding
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 * @returns A Promise that resolves with an array of tasks
 */
export const fetchTasks = (weddingId?: string) =>
  new Promise<Task[]>((resolve, reject) => {
    weddingFirebase
      .listenToCollection<Task>(
        "tasks",
        (tasks) => resolve(tasks),
        (error) => reject(error),
        weddingId
      )
      .catch((error) => {
        console.error("Error setting up tasks listener:", error);
        resolve([]);
      });
  });

/**
 * Creates a new task for the current user's wedding
 * @param task Task to create (without ID)
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const createTask = async (
  task: Omit<Task, "id">,
  weddingId?: string
) => {
  return await weddingFirebase.addDocument(
    "tasks",
    {
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
    },
    weddingId
  );
};

/**
 * Updates an existing task for the current user's wedding
 * @param id ID of the task to update
 * @param updatedFields Fields to update in the task
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const updateTask = async (
  id: string,
  updatedFields: Partial<Task>,
  weddingId?: string
) => {
  return await weddingFirebase.updateDocument<Task>(
    "tasks",
    id,
    updatedFields,
    weddingId
  );
};

/**
 * Deletes a task for the current user's wedding
 * @param id ID of the task to delete
 * @param weddingId Optional wedding ID (will use current user's wedding ID if not provided)
 */
export const deleteTask = async (id: string, weddingId?: string) => {
  return await weddingFirebase.deleteDocument("tasks", id, weddingId);
};
