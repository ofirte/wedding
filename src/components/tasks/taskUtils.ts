import { Task } from "@wedding-plan/types";

/**
 * Get border color based on task priority
 */
export const getPriorityBorderColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "#C77C58"; // Terracotta
    case "medium":
      return "#D4B957"; // Mustard yellow
    case "low":
      return "#6DA97A"; // Success green
    default:
      return "transparent";
  }
};

/**
 * Get badge color based on task priority
 */
export const getPriorityBadgeColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "#C77C58";
    case "medium":
      return "#D4B957";
    case "low":
      return "#6DA97A";
    default:
      return "#7A9CB3";
  }
};

/**
 * Get background tint based on task status and due date
 */
export const getTaskBackgroundTint = (task: Task): string => {
  if (task.completed) {
    return "rgba(109, 169, 122, 0.05)"; // Light green tint
  }

  // Check if overdue
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);

    if (dueDate < today) {
      return "rgba(199, 124, 88, 0.08)"; // Light red tint for overdue
    }

    // Check if due soon (within 3 days)
    const timeDiff = dueDate.getTime() - today.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff >= 0 && dayDiff <= 3) {
      return "rgba(212, 185, 87, 0.08)"; // Light yellow tint for due soon
    }
  }

  return "background.paper";
};

/**
 * Sort tasks: incomplete first, then by assignment status
 */
export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (!a.completed && b.completed) return -1;
    if (a.completed && !b.completed) return 1;
    if (!a.assignedTo && b.assignedTo) return -1;
    if (a.assignedTo && !b.assignedTo) return 1;
    return 0;
  });
};
