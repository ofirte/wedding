/**
 * Task Model Types
 * Task-related entity models shared between frontend and backend
 */

export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  status?: TaskStatus; // Explicit status field (defaults to derived from completed if not set)
  createdAt: string;
  completedAt?: string; // ISO timestamp when task was marked complete
  dueDate?: string;
  assignedTo?: string; // User ID of wedding member assigned to this task
  category?: string; // Category label (e.g., "Ongoing", "Personal", "Vendor")
}
