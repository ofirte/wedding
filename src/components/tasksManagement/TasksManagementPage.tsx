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
import TaskSummary from "../tasks/TaskSummary";
import { DisplayTask } from "../tasks/TaskList";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";
import {
  useProducerTasks,
  useCreateProducerTask,
  useUpdateProducerTask,
  useDeleteProducerTask,
  useCompleteProducerTask,
} from "../../hooks/producerTasks";

const TasksManagementContent: React.FC = () => {
  const { viewType, setViewType, filters, setFilters, filterTasks } =
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
  const { mutate: deleteProducerTask } = useDeleteProducerTask();
  const { mutate: completeProducerTask } = useCompleteProducerTask();

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

  const filteredTasks = filterTasks(allTasks);

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

  return (
    <Box sx={{ py: 4 }}>
      <TasksHeader currentView={viewType} onViewChange={setViewType} />

      <Paper sx={{ mt: 3, p: 3 }}>
        <TasksFiltersBar filters={filters} onFiltersChange={setFilters} />

        <Box sx={{ mt: 3 }}>
          {viewType === "calendar" ? (
            <TasksCalendarView />
          ) : viewType === "stats" ? (
            <TaskSummary tasks={filteredTasks} />
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

      {/* Floating Action Button for Creating Tasks */}
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
