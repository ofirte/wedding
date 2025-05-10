import { collection, addDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { Task } from "../hooks/tasks/useTasks";

export const migrateTasks = async (): Promise<boolean> => {
  const STORAGE_KEY = "weddingTasks";

  // Check if we've already migrated
  if (localStorage.getItem("tasksDataMigrated") === "true") {
    console.log("Tasks already migrated to Firebase, skipping migration.");
    return false;
  }

  // Get tasks from localStorage
  const savedTasksJson = localStorage.getItem(STORAGE_KEY);
  if (!savedTasksJson) {
    console.log("No tasks found in localStorage to migrate.");
    localStorage.setItem("tasksDataMigrated", "true");
    return false;
  }

  try {
    const savedTasks: Task[] = JSON.parse(savedTasksJson);
    console.log(
      `Found ${savedTasks.length} tasks to migrate from localStorage to Firebase`
    );

    // Add each task to Firebase
    const tasksCollection = collection(db, "tasks");
    for (const task of savedTasks) {
      await addDoc(tasksCollection, {
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        completed: task.completed,
        createdAt: task.createdAt,
        dueDate: task.dueDate || null,
        assignedTo: task.assignedTo || null,
      });
    }

    console.log(`Successfully migrated ${savedTasks.length} tasks to Firebase`);
    localStorage.setItem("tasksDataMigrated", "true");

    return true;
  } catch (error) {
    console.error("Error migrating tasks to Firebase:", error);
    return false;
  }
};
