/**
 * Task Template Model Types
 * Templates created by producers to reuse task structures across weddings
 */

import { Task } from './task';

/**
 * TaskTemplateItem extends Task but replaces absolute fields with relative date configuration
 * This allows templates to be reused across different weddings with dates calculated
 * relative to each wedding's date
 */
export interface TaskTemplateItem extends Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'dueDate' | 'assignedTo'> {
  // Inherits from Task: title, description, priority, category

  // Relative due date configuration (replaces absolute dueDate)
  relativeDueDate?: number; // Amount (e.g., 30, 7, 1)
  relativeDueDateUnit?: 'days' | 'weeks' | 'months'; // Unit of time
  relativeDueDateDirection?: 'before' | 'after'; // Direction relative to wedding date
}

export interface TaskTemplate {
  id: string;
  name: string; // Template name (e.g., "Standard Wedding Tasks", "Photography Checklist")
  description?: string; // Optional description of what this template is for
  tasks: TaskTemplateItem[]; // Array of task definitions
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID of the producer who created this template
}
