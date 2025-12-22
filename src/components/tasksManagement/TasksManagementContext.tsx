import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { ViewType, TaskFilter } from "./types";
import { Task } from "@wedding-plan/types";
import { getTaskStatus } from "../tasks/taskUtils";

interface TasksManagementContextType {
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  filters: TaskFilter;
  setFilters: (filters: TaskFilter) => void;
  filterTasks: (
    tasks: (Task & { weddingId?: string })[]
  ) => (Task & { weddingId?: string })[];
}

// Default filters: exclude completed tasks
const defaultFilters: TaskFilter = {
  status: ["not_started", "in_progress"],
  priority: null,
  wedding: null,
  searchText: "",
};

const TasksManagementContext = createContext<
  TasksManagementContextType | undefined
>(undefined);

export const TasksManagementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [viewType, setViewType] = useState<ViewType>("table");
  const [filters, setFilters] = useState<TaskFilter>(defaultFilters);
  const filterTasks = useMemo(
    () => (tasks: (Task & { weddingId?: string })[]) => {
      return tasks.filter((task: Task & { weddingId?: string }) => {
        // Filter by status (multiselect)
        if (filters.status?.length) {
          const taskStatus = getTaskStatus(task);
          console.log("Filtering task", task.id, "with status", taskStatus);
          if (!filters.status.includes(taskStatus)) {
            return false;
          }
        }

        // Filter by priority (multiselect)
        if (
          filters.priority?.length &&
          !filters.priority.includes(task.priority as "High" | "Medium" | "Low")
        ) {
          return false;
        }

        // Filter by wedding (only apply to tasks that have a weddingId)
        // Producer tasks (no weddingId) should always pass through
        if (filters.wedding && task.weddingId && task.weddingId !== filters.wedding) {
          return false;
        }

        // Filter by search text
        if (
          filters.searchText &&
          !task.title.toLowerCase().includes(filters.searchText.toLowerCase())
        ) {
          return false;
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
