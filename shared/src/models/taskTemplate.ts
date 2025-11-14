/**
 * Task Template Model Types
 * Templates created by producers to reuse task structures across weddings
 */

export interface TaskTemplateItem {
  title: string;
  description?: string;
  priority: string;
  category?: string;
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
