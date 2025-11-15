/**
 * Task Template Utilities
 * Helper functions for working with task templates, particularly date calculations
 */

import { addDays, addWeeks, addMonths } from 'date-fns';
import { Task } from '../../shared/src/models/task';
import { TaskTemplateItem, TaskTemplate } from '../../shared/src/models/taskTemplate';

/**
 * Calculate an absolute due date from a relative date configuration
 * @param weddingDate The wedding's date (UTC midnight)
 * @param relativeDueDate The amount (e.g., 30, 7, 1)
 * @param unit The time unit (days, weeks, months)
 * @param direction Whether the date is before or after the wedding
 * @returns The calculated absolute date
 */
export function calculateAbsoluteDueDate(
  weddingDate: Date,
  relativeDueDate: number,
  unit: 'days' | 'weeks' | 'months',
  direction: 'before' | 'after'
): Date {
  // Select the appropriate date-fns function based on unit
  const addFn = {
    days: addDays,
    weeks: addWeeks,
    months: addMonths,
  }[unit];

  // Calculate offset: negative for "before", positive for "after"
  const offset = direction === 'before' ? -relativeDueDate : relativeDueDate;

  return addFn(weddingDate, offset);
}

/**
 * Convert a TaskTemplateItem to a Task object ready for creation
 * @param templateItem The template item with relative date configuration
 * @param weddingDate Optional wedding date for calculating absolute due dates
 * @returns Task object without ID (ready for creation), with no undefined fields
 */
export function convertTemplateItemToTask(
  templateItem: TaskTemplateItem,
  weddingDate?: Date
): Omit<Task, 'id'> {
  const task: any = {
    title: templateItem.title,
    priority: templateItem.priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // Only add optional fields if they have values
  if (templateItem.description?.trim()) {
    task.description = templateItem.description.trim();
  }

  if (templateItem.category?.trim()) {
    task.category = templateItem.category.trim();
  }

  // Calculate due date if all relative date fields are present and we have a wedding date
  if (
    weddingDate &&
    templateItem.relativeDueDate !== undefined &&
    templateItem.relativeDueDateUnit &&
    templateItem.relativeDueDateDirection
  ) {
    const dueDate = calculateAbsoluteDueDate(
      weddingDate,
      templateItem.relativeDueDate,
      templateItem.relativeDueDateUnit,
      templateItem.relativeDueDateDirection
    );
    // Format as YYYY-MM-DD for consistency with existing task dates
    task.dueDate = dueDate.toISOString().split('T')[0];
  }

  return task;
}

/**
 * Get a human-readable description of a relative due date
 * @param amount The amount (e.g., 30)
 * @param unit The unit (days, weeks, months)
 * @param direction before or after
 * @returns Human-readable string (e.g., "30 days before wedding")
 */
export function formatRelativeDueDate(
  amount: number,
  unit: 'days' | 'weeks' | 'months',
  direction: 'before' | 'after'
): string {
  const unitLabel = amount === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular
  return `${amount} ${unitLabel} ${direction} wedding`;
}

/**
 * Preview what the absolute due date would be for a template item
 * given a specific wedding date
 * @param templateItem The template item
 * @param weddingDate The wedding date
 * @returns The absolute due date, or null if relative date is not configured
 */
export function previewAbsoluteDueDate(
  templateItem: TaskTemplateItem,
  weddingDate: Date
): Date | null {
  if (
    templateItem.relativeDueDate === undefined ||
    !templateItem.relativeDueDateUnit ||
    !templateItem.relativeDueDateDirection
  ) {
    return null;
  }

  return calculateAbsoluteDueDate(
    weddingDate,
    templateItem.relativeDueDate,
    templateItem.relativeDueDateUnit,
    templateItem.relativeDueDateDirection
  );
}

/**
 * Clean a task template item by removing undefined fields
 * Firebase doesn't accept undefined values, so we omit optional fields that don't have values
 * @param task The task template item to clean
 * @returns Cleaned task object without undefined fields
 */
export function cleanTaskTemplateItem(task: TaskTemplateItem): Partial<TaskTemplateItem> {
  const cleanedTask: any = {
    title: task.title.trim(),
    priority: task.priority,
  };

  // Only add optional fields if they have values
  if (task.description?.trim()) {
    cleanedTask.description = task.description.trim();
  }
  if (task.category?.trim()) {
    cleanedTask.category = task.category.trim();
  }

  // Add relative due date fields only if all three are present
  if (
    task.relativeDueDate !== undefined &&
    task.relativeDueDateUnit &&
    task.relativeDueDateDirection
  ) {
    cleanedTask.relativeDueDate = task.relativeDueDate;
    cleanedTask.relativeDueDateUnit = task.relativeDueDateUnit;
    cleanedTask.relativeDueDateDirection = task.relativeDueDateDirection;
  }

  return cleanedTask;
}

/**
 * Task Library Item - derived from templates
 * Represents a reusable task that can be added to new templates
 */
export interface TaskLibraryItem extends TaskTemplateItem {
  usageCount: number; // How many templates use this task
  lastUsed: string; // ISO timestamp of last use
  sourceTemplateIds: string[]; // Templates that contain this task
}

/**
 * Build a virtual task library from all templates
 * Groups tasks by title (case-insensitive) and tracks usage
 * @param templates All task templates
 * @returns Array of unique tasks with usage metrics
 */
export function buildTaskLibraryFromTemplates(
  templates: TaskTemplate[]
): TaskLibraryItem[] {
  const taskMap = new Map<string, TaskLibraryItem>();

  templates.forEach((template) => {
    template.tasks.forEach((task) => {
      const normalizedTitle = task.title.trim().toLowerCase();

      if (taskMap.has(normalizedTitle)) {
        // Task already exists - update usage metrics
        const existing = taskMap.get(normalizedTitle)!;
        existing.usageCount++;
        existing.sourceTemplateIds.push(template.id);
        // Update lastUsed if this template is newer
        if (template.updatedAt > existing.lastUsed) {
          existing.lastUsed = template.updatedAt;
        }
      } else {
        // New task - add to library
        taskMap.set(normalizedTitle, {
          ...task,
          usageCount: 1,
          lastUsed: template.updatedAt || template.createdAt,
          sourceTemplateIds: [template.id],
        });
      }
    });
  });

  // Convert map to array and sort by usage count (most used first)
  return Array.from(taskMap.values()).sort(
    (a, b) => b.usageCount - a.usageCount
  );
}
