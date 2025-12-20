import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { TableRows, List } from "@mui/icons-material";
import TaskList from "./TaskList";
import TaskSummary from "./TaskSummary";
import { TaskInlineTable, DisplayTask } from "./TaskInlineTable";
import useTasks from "../../hooks/tasks/useTasks";
import { useCreateTask } from "../../hooks/tasks/useCreateTask";
import { useUpdateTask } from "../../hooks/tasks/useUpdateTask";
import { useUpdateTaskOptimistic } from "../../hooks/tasks/useUpdateTaskOptimistic";
import { useDeleteTask } from "../../hooks/tasks/useDeleteTask";
import { useAssignTask } from "../../hooks/tasks/useAssignTask";
import { useCompleteTask } from "../../hooks/tasks/useCompleteTask";
import { useWeddingMembers } from "../../hooks/wedding";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

type ViewType = "table" | "list";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
}));

const TaskManager: React.FC = () => {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<ViewType>("table");

  const { data: tasks, isLoading } = useTasks();
  const { data: weddingMembers = [] } = useWeddingMembers();
  const { mutate: createTask, isPending: isPendingCreation } = useCreateTask();
  const { mutate: updateTask, isPending: isPendingUpdate } = useUpdateTask();
  const { mutateAsync: updateTaskOptimistic } = useUpdateTaskOptimistic();
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
  const handleFilterChange = (_filterType: string) => {
    // For now, clicking summary cards just switches to list view
    // The inline table handles its own filtering
    setViewType("list");
  };

  // Convert tasks to DisplayTask format
  const displayTasks: DisplayTask[] = useMemo(() => {
    return (tasks ?? []).map((task) => ({
      ...task,
      taskType: "wedding" as const,
    }));
  }, [tasks]);

  // Handle view change
  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  // Handlers for TaskInlineTable - uses optimistic update for instant feedback
  const handleCellUpdate = async (
    _rowId: string | number,
    field: string,
    value: any,
    row: DisplayTask
  ) => {
    await updateTaskOptimistic({ id: row.id, data: { [field]: value } });
  };

  const handleAddRow = (
    newRow: Omit<Task, "id">,
    onSuccess?: (newRowId: string | number) => void
  ) => {
    createTask(
      { task: newRow },
      {
        onSuccess: (docRef) => {
          if (onSuccess && docRef?.id) {
            onSuccess(docRef.id);
          }
        },
      }
    );
  };

  const handleDelete = (task: DisplayTask) => {
    deleteTask({ id: task.id });
  };

  const handleComplete = (task: DisplayTask, completed: boolean) => {
    completeTask(task.id, completed);
  };

  const handleBulkComplete = (tasksToComplete: DisplayTask[]) => {
    tasksToComplete.forEach((task) => {
      completeTask(task.id, true);
    });
  };

  const handleBulkDelete = (tasksToDelete: DisplayTask[]) => {
    tasksToDelete.forEach((task) => {
      deleteTask({ id: task.id });
    });
  };

  // Legacy handlers for TaskList
  const handleUpdate = (task: DisplayTask, data: Partial<Task>) => {
    updateTask({ id: task.id, data });
  };

  const handleAssign = (task: DisplayTask, userId: string) => {
    assignTask(task.id, userId);
  };

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
          {/* Header with view switcher */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">{t("tasks.title")}</Typography>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="table" aria-label="table view">
                <TableRows fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <List fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Content based on view type */}
          <Box>
            {isUpdating && viewType === "list" && (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress size={24} />
              </Box>
            )}

            {viewType === "table" ? (
              <TaskInlineTable
                tasks={displayTasks}
                onCellUpdate={handleCellUpdate}
                onAddRow={handleAddRow}
                onDelete={handleDelete}
                onBulkComplete={handleBulkComplete}
                onBulkDelete={handleBulkDelete}
                weddingMembers={weddingMembers}
              />
            ) : (
              <TaskList
                tasks={displayTasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAssign={handleAssign}
                onComplete={handleComplete}
              />
            )}
          </Box>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default TaskManager;
