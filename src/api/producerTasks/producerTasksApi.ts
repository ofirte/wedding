import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import { ProducerTask } from "@wedding-plan/types";
import { auth } from "../firebaseConfig";

// Create basic CRUD operations for producer tasks using the general collection API
const producerTasksAPI = createGeneralCollectionAPI<ProducerTask>("producerTasks");

// Helper to remove undefined values (Firestore doesn't accept undefined)
const removeUndefined = <T extends object>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as T;
};

/**
 * Get the current producer's user ID
 */
const getCurrentProducerId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user - please sign in");
  }
  return user.uid;
};

/**
 * Fetch all producer tasks for the current producer
 * Uses array-contains to support future collaboration scenarios
 */
export const fetchProducerTasks = async (): Promise<ProducerTask[]> => {
  const producerId = getCurrentProducerId();
  return producerTasksAPI.fetchByFilter([
    { field: "producerIds", op: "array-contains", value: producerId },
  ]);
};

/**
 * Fetch a single producer task by ID (validates access)
 */
export const fetchProducerTask = async (
  taskId: string
): Promise<ProducerTask | null> => {
  const task = await producerTasksAPI.fetchById(taskId);
  if (!task) return null;

  // Validate that the current user has access to this task
  const producerId = getCurrentProducerId();
  if (!task.producerIds.includes(producerId)) {
    throw new Error("Unauthorized: You don't have access to this task");
  }

  return task;
};

/**
 * Create a new producer task for the current producer
 */
export const createProducerTask = async (
  taskData: Omit<ProducerTask, "id" | "producerIds" | "createdBy" | "createdAt">
): Promise<any> => {
  const producerId = getCurrentProducerId();
  const now = new Date().toISOString();

  const newTask: Omit<ProducerTask, "id"> = removeUndefined({
    ...taskData,
    producerIds: [producerId], // Start with just the creator
    createdBy: producerId,
    createdAt: now,
    completed: false,
  });

  return producerTasksAPI.create(newTask);
};

/**
 * Update a producer task (validates access)
 */
export const updateProducerTask = async (
  taskId: string,
  updates: Partial<ProducerTask>
): Promise<void> => {
  // Validate access first
  await fetchProducerTask(taskId);

  // Don't allow changing producerIds or createdBy through updates
  const { producerIds, createdBy, ...safeUpdates } = updates;

  return producerTasksAPI.update(taskId, safeUpdates);
};

/**
 * Delete a producer task (validates access)
 */
export const deleteProducerTask = async (taskId: string): Promise<void> => {
  // Validate access first
  await fetchProducerTask(taskId);

  return producerTasksAPI.delete(taskId);
};

/**
 * Mark a producer task as complete or incomplete
 */
export const completeProducerTask = async (
  taskId: string,
  completed: boolean
): Promise<void> => {
  // Validate access first
  await fetchProducerTask(taskId);

  const updates: Partial<ProducerTask> = {
    completed,
    status: completed ? "completed" : "not_started",
    completedAt: completed ? new Date().toISOString() : undefined,
  };

  return producerTasksAPI.update(taskId, updates);
};

/**
 * Bulk update multiple producer tasks (validates access to all)
 */
export const bulkUpdateProducerTasks = async (
  updates: Array<{ id: string; data: Partial<ProducerTask> }>
): Promise<void> => {
  // Validate access to all tasks first
  await Promise.all(updates.map((update) => fetchProducerTask(update.id)));

  // Remove protected fields from updates
  const safeUpdates = updates.map((update) => {
    const { producerIds, createdBy, ...safeData } = update.data;
    return { id: update.id, data: safeData };
  });

  return producerTasksAPI.bulkUpdate(safeUpdates);
};

/**
 * Bulk delete multiple producer tasks (validates access to all)
 */
export const bulkDeleteProducerTasks = async (
  taskIds: string[]
): Promise<void> => {
  // Validate access to all tasks first
  await Promise.all(taskIds.map((id) => fetchProducerTask(id)));

  return producerTasksAPI.bulkDelete(taskIds);
};
