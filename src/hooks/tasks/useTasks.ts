import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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

// Initial tasks for demo purposes
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    title: "Choose wedding venue",
    description: "Research and visit potential wedding venues",
    priority: "High",
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30))
      .toISOString()
      .split("T")[0],
  },
  {
    id: uuidv4(),
    title: "Book photographer",
    description: "Find and book a wedding photographer",
    priority: "Medium",
    completed: false,
    assignedTo: "Bride",
    createdAt: new Date().toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 45))
      .toISOString()
      .split("T")[0],
  },
  {
    id: uuidv4(),
    title: "Order wedding cake",
    description: "Choose flavor and design for wedding cake",
    priority: "Low",
    completed: false,
    assignedTo: "Groom",
    createdAt: new Date().toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 60))
      .toISOString()
      .split("T")[0],
  },
  {
    id: uuidv4(),
    title: "Send out save-the-date cards",
    description: "Design and send save-the-date cards to guests",
    priority: "Medium",
    completed: true,
    assignedTo: "Both",
    createdAt: new Date(
      new Date().setDate(new Date().getDate() - 15)
    ).toISOString(),
  },
];

const STORAGE_KEY = "weddingTasks";

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load tasks from localStorage or use initial demo data
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const assignTask = (id: string, person: string) => {
    updateTask(id, { assignedTo: person });
  };

  const completeTask = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    completeTask,
  };
};

export default useTasks;
