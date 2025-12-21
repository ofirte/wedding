/**
 * Producer Task Model Types
 * Tasks that belong to producers, not tied to a specific wedding
 */

import { TaskStatus } from "./task";

export interface ProducerTask {
  id: string;
  title: string;
  description?: string;
  priority: string; // High, Medium, Low
  completed: boolean;
  status?: TaskStatus; // Explicit status field (defaults to derived from completed if not set)
  createdAt: string;
  completedAt?: string; // ISO timestamp when task was marked complete
  dueDate?: string;
  category?: string; // Category label (e.g., "Follow-up", "Admin", "Lead")
  producerIds: string[]; // Array of producer User IDs (supports future collaboration)
  createdBy: string; // User ID of who created the task
}
