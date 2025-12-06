import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskSummary from "./TaskSummary";
import TaskFilterBar, { TaskFilters } from "./TaskFilterBar";
import useTasks from "../../hooks/tasks/useTasks";
import { useCreateTask } from "../../hooks/tasks/useCreateTask";
import { useUpdateTask } from "../../hooks/tasks/useUpdateTask";
import { useDeleteTask } from "../../hooks/tasks/useDeleteTask";
import { useAssignTask } from "../../hooks/tasks/useAssignTask";
import { useCompleteTask } from "../../hooks/tasks/useCompleteTask";
import { Task } from "@wedding-plan/types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
}));

const TaskManager: React.FC = () => {
  const [filters, setFilters] = useState<TaskFilters>({
    searchText: "",
    status: "all",
    priority: "",
  });

  const { data: tasks, isLoading } = useTasks();
  const { mutate: createTask, isPending: isPendingCreation } = useCreateTask();
  const { mutate: updateTask, isPending: isPendingUpdate } = useUpdateTask();
  const { mutate: deleteTask, isPending: isPendingDeletion } = useDeleteTask();
  const { mutate: assignTask, isPending: isPendingAssignment } =
    useAssignTask();
  const { mutate: completeTask, isPending: isPendingCompletion } =
    useCompleteTask();

  // Track loading states
  const isUpdating =
    isPendingCreation ||
    isPendingUpdate ||
    isPendingDeletion ||
    isPendingAssignment ||
    isPendingCompletion;

  // Handle card clicks from TaskSummary
  const handleFilterChange = (filterType: string) => {
    if (filterType === "open") {
      setFilters({ searchText: "", status: "open", priority: "" });
    } else if (filterType === "completed") {
      setFilters({ searchText: "", status: "completed", priority: "" });
    } else if (filterType === "highPriority") {
      setFilters({ searchText: "", status: "open", priority: "High" });
    } else if (filterType === "pastDue") {
      setFilters({ searchText: "", status: "pastDue", priority: "" });
    }
  };

  const handleAddTask = (task: Omit<Task, "id">, weddingId?: string) => {
    createTask({ task , weddingId });
  }

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      // Search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "open") {
          if (task.completed) return false;
        } else if (filters.status === "unassigned") {
          if (task.assignedTo || task.completed) return false;
        } else if (filters.status === "inProgress") {
          if (!task.assignedTo || task.completed) return false;
        } else if (filters.status === "completed") {
          if (!task.completed) return false;
        } else if (filters.status === "pastDue") {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(task.dueDate);
          if (dueDate >= today) return false;
        }
      }

      // Priority filter
      if (filters.priority !== "") {
        if (task.priority !== filters.priority) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <TaskSummary tasks={tasks ?? []} onFilterChange={handleFilterChange} />
        </Box>

        <StyledPaper>
          <TaskFilterBar filters={filters} onFiltersChange={setFilters} />

          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 3 }}>
            <TaskForm onAddTask={handleAddTask} isSubmitting={isUpdating} />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box>
            {isUpdating && (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            <TaskList
              tasks={filteredTasks}
              onUpdate={(task, data) => updateTask({ id: task.id, data })}
              onDelete={(task) => deleteTask({ id: task.id })}
              onAssign={(task, userId) => assignTask(task.id, userId)}
              onComplete={(task, completed) => completeTask(task.id, completed)}
            />
          </Box>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default TaskManager;
