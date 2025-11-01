import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { ViewType, TaskFilter } from "./types";
import { Task } from "@wedding-plan/types";

interface TasksManagementContextType {
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  filters: TaskFilter;
  setFilters: (filters: TaskFilter) => void;
  filterTasks: (tasks: (Task & { weddingId: string })[]) => (Task & { weddingId: string })[];
}

const defaultFilters: TaskFilter = {
  wedding: null,
  priority: null,
  status: "all",
  searchText: "",
  dateRange: {
    start: null,
    end: null,
  },
};

const TasksManagementContext = createContext<
  TasksManagementContextType | undefined
>(undefined);

export const TasksManagementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [viewType, setViewType] = useState<ViewType>("list");
  const [filters, setFilters] = useState<TaskFilter>(defaultFilters);
  console.log("Current Filters:", filters);
  const filterTasks = useMemo(
    () => (tasks: (Task & { weddingId: string })[]) => {
      return tasks.filter((task: Task & { weddingId?: string }) => {
        // Filter by wedding
        if (filters.wedding && task.weddingId !== filters.wedding) {
          return false;
        }

        // Filter by priority
        if (
          filters.priority?.length &&
          !filters.priority.includes(task.priority as "high" | "medium" | "low")
        ) {
          return false;
        }

        // Filter by status
        if (filters.status !== "all") {
          if (filters.status === "completed" && !task.completed) {
            return false;
          }
          if (filters.status === "pending" && task.completed) {
            return false;
          }
        }

        // Filter by search text
        if (
          filters.searchText &&
          !task.title.toLowerCase().includes(filters.searchText.toLowerCase())
        ) {
          return false;
        }

        // Filter by date range
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (
            filters.dateRange.start &&
            dueDate < new Date(filters.dateRange.start)
          ) {
            return false;
          }
          if (
            filters.dateRange.end &&
            dueDate > new Date(filters.dateRange.end)
          ) {
            return false;
          }
        }

        return true;
      });
    },
    [filters]
  );

  return (
    <TasksManagementContext.Provider
      value={{
        viewType,
        setViewType,
        filters,
        setFilters,
        filterTasks,
      }}
    >
      {children}
    </TasksManagementContext.Provider>
  );
};

export const useTasksManagement = () => {
  const context = useContext(TasksManagementContext);
  if (!context) {
    throw new Error(
      "useTasksManagement must be used within a TasksManagementProvider"
    );
  }
  return context;
};
