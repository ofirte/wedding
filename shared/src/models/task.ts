/**
 * Task Model Types
 * Task-related entity models shared between frontend and backend
 */

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
