import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import { TaskTemplate, TaskTemplateItem } from "@wedding-plan/types";
import { auth } from "../firebaseConfig";
import { bulkCreateDocuments } from "../weddingFirebaseHelpers";

// Create all CRUD operations for task templates (top-level collection, producer-scoped)
const taskTemplatesAPI =
  createGeneralCollectionAPI<TaskTemplate>("producerTaskTemplates");

// Export standard CRUD operations
export const fetchTaskTemplate = taskTemplatesAPI.fetchById;
export const updateTaskTemplate = taskTemplatesAPI.update;
export const deleteTaskTemplate = taskTemplatesAPI.delete;

// Custom create function that adds timestamps and user ID
export const createTaskTemplate = async (
  template: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "createdBy">
) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User must be authenticated to create templates");
  }

  return taskTemplatesAPI.create({
    ...template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
  });
};

// Fetch all templates for the current user
export const fetchUserTaskTemplates = async (): Promise<TaskTemplate[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User must be authenticated to fetch templates");
  }

  return taskTemplatesAPI.fetchByFilter([
    { field: "createdBy", op: "==", value: userId },
  ]);
};

// Apply a template to a wedding (creates tasks from template)
export const applyTemplateToWedding = async (
  templateId: string,
  weddingId?: string
): Promise<void> => {
  const template = await fetchTaskTemplate(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  // Convert template tasks to actual tasks
  const tasks = template.tasks.map((taskItem: TaskTemplateItem) => ({
    title: taskItem.title,
    description: taskItem.description,
    priority: taskItem.priority,
    category: taskItem.category,
    completed: false,
    createdAt: new Date().toISOString(),
  }));

  // Bulk create tasks in the wedding
  await bulkCreateDocuments("tasks", tasks, weddingId);
};
