import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TasksHeader from "./header/TasksHeader";
import TasksFiltersBar from "./filters/TasksFiltersBar";
import TasksCalendarView from "./calendar/TasksCalendarView";
import TasksListView from "./list/TasksListView";
import {
  TasksManagementProvider,
  useTasksManagement,
} from "./TasksManagementContext";
import { useCreateTask } from "../../hooks/tasks/useCreateTask";
import { useUpdateTask } from "../../hooks/tasks/useUpdateTask";
import { useDeleteTask } from "../../hooks/tasks/useDeleteTask";
import { useAssignTask } from "../../hooks/tasks/useAssignTask";
import { useCompleteTask } from "../../hooks/tasks/useCompleteTask";
import { Task, ProducerTask } from "@wedding-plan/types";
import TaskForm from "../tasks/TaskForm";
import { TaskInlineTable, DisplayTask, ColumnFilterState } from "../tasks/TaskInlineTable";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";
import {
  useProducerTasks,
  useCreateProducerTask,
  useUpdateProducerTask,
  useUpdateProducerTaskOptimistic,
  useDeleteProducerTask,
  useCompleteProducerTask,
} from "../../hooks/producerTasks";
import { useUpdateTaskOptimistic } from "../../hooks/tasks/useUpdateTaskOptimistic";

// Default filters for inline table: exclude completed tasks
const DEFAULT_TABLE_FILTERS: ColumnFilterState[] = [
  {
    columnId: "status",
    type: "multiselect",
    value: { values: ["not_started", "in_progress"] },
  },
];

const TasksManagementContent: React.FC = () => {
  const { viewType, setViewType, filters, setFilters } =
    useTasksManagement();
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Wedding task mutation hooks
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: assignTask } = useAssignTask();
  const { mutate: completeTask } = useCompleteTask();

  // Producer task mutation hooks
  const { mutate: createProducerTask, isPending: isCreatingProducerTask } =
    useCreateProducerTask();
  const { mutate: updateProducerTask } = useUpdateProducerTask();
  const { mutateAsync: updateProducerTaskOptimistic } = useUpdateProducerTaskOptimistic();
  const { mutate: deleteProducerTask } = useDeleteProducerTask();
  const { mutate: completeProducerTask } = useCompleteProducerTask();

  // Optimistic update hooks for inline table editing
  const { mutateAsync: updateTaskOptimistic } = useUpdateTaskOptimistic();

  // Fetch wedding tasks
  const { data: weddingTasks = [] } = useAllWeddingsTasks();

  // Fetch producer tasks
  const { data: producerTasks = [] } = useProducerTasks();

  // Fetch weddings for the form dropdown
  const { data: weddings = [] } = useWeddingsDetails();

  // Combine wedding tasks and producer tasks for unified display
  const allTasks: DisplayTask[] = useMemo(() => {
    const weddingDisplayTasks: DisplayTask[] = weddingTasks.map((task) => ({
      ...task,
      taskType: "wedding" as const,
    }));

    const producerDisplayTasks: DisplayTask[] = producerTasks.map((task) => ({
      ...task,
      taskType: "producer" as const,
      weddingId: undefined,
    }));

    return [...weddingDisplayTasks, ...producerDisplayTasks];
  }, [weddingTasks, producerTasks]);

  const isCreating = isCreatingTask || isCreatingProducerTask;

  // Create task handlers
  const handleCreateTask = (task: Omit<Task, "id">, weddingId?: string) => {
    createTask({ task, weddingId });
    setCreateDialogOpen(false);
  };

  const handleCreateProducerTask = (
    task: Omit<ProducerTask, "id" | "producerIds" | "createdBy" | "createdAt">
  ) => {
    createProducerTask(task);
    setCreateDialogOpen(false);
  };

  // Unified handlers that route based on taskType
  const handleUpdate = (task: DisplayTask, data: Partial<Task>) => {
    if (task.taskType === "producer") {
      updateProducerTask({ id: task.id, data });
    } else {
      updateTask({ id: task.id, data, weddingId: task.weddingId || "" });
    }
  };

  const handleDelete = (task: DisplayTask) => {
    if (task.taskType === "producer") {
      deleteProducerTask(task.id);
    } else {
      deleteTask({ id: task.id, weddingId: task.weddingId || "" });
    }
  };

  const handleAssign = (task: DisplayTask, userId: string) => {
    if (task.taskType === "producer") {
      // Producer tasks don't have assignTo functionality
      return;
    }
    assignTask(task.id, userId || "", task.weddingId || "");
  };

  const handleComplete = (task: DisplayTask, completed: boolean) => {
    if (task.taskType === "producer") {
      completeProducerTask({ id: task.id, completed });
    } else {
      completeTask(task.id, completed, task.weddingId || "");
    }
  };

  // Handle inline cell update for table view - uses optimistic updates
  const handleCellUpdate = async (
    _rowId: string | number,
    field: string,
    value: any,
    row: DisplayTask
  ) => {
    // Special handling for weddingId field - switching between producer/wedding tasks
    if (field === "weddingId") {
      const isMovingToProducer = value === "producer";
      const isCurrentlyProducer = row.taskType === "producer";

      if (isMovingToProducer && !isCurrentlyProducer) {
        // Moving from wedding task to producer task
        // Delete from wedding, create as producer
        const { id, weddingId: _oldWeddingId, taskType: _type, ...taskData } = row;
        deleteTask({ id, weddingId: row.weddingId || "" });
        createProducerTask(taskData);
        return;
      } else if (!isMovingToProducer && isCurrentlyProducer) {
        // Moving from producer task to wedding task
        // Delete from producer, create as wedding task
        const { id, taskType: _type, ...taskData } = row;
        deleteProducerTask(id);
        createTask({ task: taskData, weddingId: value });
        return;
      } else if (!isMovingToProducer && !isCurrentlyProducer) {
        // Moving between weddings - just update weddingId
        // This is more complex as tasks are stored per-wedding
        // For now, delete from old wedding and create in new
        const { id, weddingId: oldWeddingId, taskType: _type, ...taskData } = row;
        deleteTask({ id, weddingId: oldWeddingId || "" });
        createTask({ task: taskData, weddingId: value });
        return;
      }
      // If already producer and staying producer, nothing to do
      return;
    }

    // Regular field update - use optimistic hooks
    const data = { [field]: value };
    if (row.taskType === "producer") {
      await updateProducerTaskOptimistic({ id: row.id, data });
    } else {
      // Pass weddingId explicitly for wedding tasks (not available in URL on this page)
      await updateTaskOptimistic({ id: row.id, data, weddingId: row.weddingId });
    }
  };

  // Handle inline add row with task type selection (two-step flow)
  const handleAddRowWithType = (
    newRow: Omit<Task, "id">,
    taskType: "producer" | "wedding",
    weddingId: string | undefined,
    onSuccess?: (newRowId: string | number) => void
  ) => {
    if (taskType === "producer") {
      createProducerTask(newRow, {
        onSuccess: (docRef) => {
          if (onSuccess && docRef?.id) {
            onSuccess(docRef.id);
          }
        },
      });
    } else if (taskType === "wedding" && weddingId) {
      createTask(
        { task: newRow, weddingId },
        {
          onSuccess: (docRef) => {
            if (onSuccess && docRef?.id) {
              onSuccess(docRef.id);
            }
          },
        }
      );
    }
  };

  // Handle bulk complete
  const handleBulkComplete = (tasks: DisplayTask[]) => {
    tasks.forEach((task) => {
      handleComplete(task, true);
    });
  };

  // Handle bulk delete
  const handleBulkDelete = (tasks: DisplayTask[]) => {
    tasks.forEach((task) => {
      handleDelete(task);
    });
  };

  return (
    <Box sx={{ py: 4 }}>
      <TasksHeader currentView={viewType} onViewChange={setViewType} />

      <Paper sx={{ mt: 3, p: 3 }}>
        {viewType !== "table" && (
          <TasksFiltersBar filters={filters} onFiltersChange={setFilters} />
        )}

        <Box sx={{ mt: viewType !== "table" ? 3 : 0 }}>
          {viewType === "table" ? (
            <TaskInlineTable
              tasks={allTasks}
              onCellUpdate={handleCellUpdate}
              onAddRowWithType={handleAddRowWithType}
              onDelete={handleDelete}
              onBulkComplete={handleBulkComplete}
              onBulkDelete={handleBulkDelete}
              showWeddingColumn
              weddings={weddings}
              defaultFilters={DEFAULT_TABLE_FILTERS}
            />
          ) : viewType === "calendar" ? (
            <TasksCalendarView />
          ) : (
            <TasksListView
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAssign={handleAssign}
              onComplete={handleComplete}
            />
          )}
        </Box>
      </Paper>

      {/* Floating Action Button for Creating Tasks - hidden in table view (table has inline add) */}
      {viewType !== "table" && (
        <Fab
          color="primary"
          aria-label="add task"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("tasksManagement.createTask")}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TaskForm
              onAddTask={handleCreateTask}
              onAddProducerTask={handleCreateProducerTask}
              isSubmitting={isCreating}
              mode="create"
              onCancel={() => setCreateDialogOpen(false)}
              context="producer"
              weddings={weddings}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const TasksManagementPage: React.FC = () => {
  return (
    <TasksManagementProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="xl">
          <TasksManagementContent />
        </Container>
      </LocalizationProvider>
    </TasksManagementProvider>
  );
};

export default TasksManagementPage;
