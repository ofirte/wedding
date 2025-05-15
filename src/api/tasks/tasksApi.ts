import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Task } from "../../hooks/tasks/useTasks";

export const fetchTasks = () =>
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
  });

export const createTask = async (task: Omit<Task, "id">) => {
  return await addDoc(collection(db, "tasks"), {
    ...task,
    createdAt: task.createdAt || new Date().toISOString(),
  });
};

export const updateTask = async (id: string, updatedFields: Partial<Task>) => {
  const taskRef = doc(db, "tasks", id);

  const sanitizedFields = Object.entries(updatedFields).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  return await updateDoc(taskRef, sanitizedFields);
};

export const deleteTask = async (id: string) => {
  return await deleteDoc(doc(db, "tasks", id));
};
