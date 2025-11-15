import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import { TaskTemplate, TaskTemplateItem, AppliedTaskTemplate } from "@wedding-plan/types";
import { auth } from "../firebaseConfig";
import { bulkCreateDocuments } from "../weddingFirebaseHelpers";
import { convertTemplateItemToTask } from "../../utils/taskTemplateUtils";
import { getWeddingDetails, updateWeddingDetails } from "../wedding/weddingApi";

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
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User must be authenticated to apply templates");
  }

  // Fetch the template
  const template = await fetchTaskTemplate(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  // Fetch wedding details to get the wedding date
  let weddingDate: Date | undefined;
  if (weddingId) {
    const wedding = await getWeddingDetails(weddingId);
    if (!wedding) {
      throw new Error("Wedding not found");
    }
    weddingDate = wedding.date;
  }

  // Convert template tasks to actual tasks using the utility function
  // This will calculate absolute due dates from relative dates if wedding date is available
  const tasks = template.tasks.map((taskItem: TaskTemplateItem) =>
    convertTemplateItemToTask(taskItem, weddingDate)
  );

  // Bulk create tasks in the wedding
  await bulkCreateDocuments("tasks", tasks, weddingId);

  // Track template application on the wedding document for audit trail
  if (weddingId) {
    const wedding = await getWeddingDetails(weddingId);
    if (wedding) {
      const appliedTemplate: AppliedTaskTemplate = {
        templateId: template.id,
        templateName: template.name,
        appliedAt: new Date().toISOString(),
        appliedBy: userId,
      };

      const existingAppliedTemplates = wedding.appliedTaskTemplates || [];
      await updateWeddingDetails(weddingId, {
        appliedTaskTemplates: [...existingAppliedTemplates, appliedTemplate],
      });
    }
  }
};
