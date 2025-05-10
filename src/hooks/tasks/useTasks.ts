import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../api/firebaseConfig";

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

/**
 * Custom hook to fetch and manage tasks using TanStack Query and Firebase
 */
const useTasks = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch tasks using TanStack Query
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () =>
      new Promise<Task[]>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          collection(db, "tasks"),
          (snapshot) => {
            const tasksData = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title,
                description: data.description,
                priority: data.priority,
                completed: data.completed,
                createdAt: data.createdAt,
                dueDate: data.dueDate,
                assignedTo: data.assignedTo,
              };
            });
            resolve(tasksData);
          },
          (error) => {
            if (error.code === "permission-denied") {
              console.error("Error fetching tasks: ", error.message);
              reject(error);
            } else {
              console.error("Error fetching tasks: ", error);
              reject(error);
            }
          }
        );

        // Return unsubscribe function for cleanup
        return unsubscribe;
      }),
    refetchOnWindowFocus: false, // Using real-time updates through onSnapshot
  });

  // Add a new task
  const addTask = useCallback(
    async (task: Omit<Task, "id">) => {
      try {
        setIsUpdating(true);
        await addDoc(collection(db, "tasks"), {
          ...task,
          createdAt: task.createdAt || new Date().toISOString(),
        });
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch (error) {
        console.error("Error adding task: ", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [queryClient]
  );

  // Update a task with new fields
  const updateTask = useCallback(
    async (id: string, updatedFields: Partial<Task>) => {
      try {
        setIsUpdating(true);
        const taskRef = doc(db, "tasks", id);

        // Remove undefined fields to prevent Firestore errors
        const sanitizedFields = Object.entries(updatedFields).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>
        );

        await updateDoc(taskRef, sanitizedFields);
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch (error) {
        console.error("Error updating task: ", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [queryClient]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        setIsUpdating(true);
        await deleteDoc(doc(db, "tasks", id));
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } catch (error) {
        console.error("Error deleting task: ", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [queryClient]
  );

  // Assign a task to someone
  const assignTask = useCallback(
    async (id: string, person: string) => {
      await updateTask(id, { assignedTo: person });
    },
    [updateTask]
  );

  // Mark a task as complete/incomplete
  const completeTask = useCallback(
    async (id: string, completed: boolean) => {
      await updateTask(id, { completed });
    },
    [updateTask]
  );

  return {
    tasks,
    isUpdating,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    completeTask,
  };
};

export default useTasks;
