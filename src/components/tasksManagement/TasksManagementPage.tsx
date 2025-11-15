import React, { useState } from "react";
import { Box, Container, Paper, Dialog, DialogTitle, DialogContent, Fab } from "@mui/material";
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
import { Task } from "@wedding-plan/types";
import TaskForm from "../tasks/TaskForm";
import TaskSummary from "../tasks/TaskSummary";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";

const TasksManagementContent: React.FC = () => {
  const { viewType, setViewType, filters, setFilters, filterTasks } = useTasksManagement();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mutation hooks
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: assignTask } = useAssignTask();
  const { mutate: completeTask } = useCompleteTask();

  // Fetch tasks for stats view
  const { data: tasks = [] } = useAllWeddingsTasks();
  const filteredTasks = filterTasks(tasks);

  // Handlers
  const handleCreateTask = (task: Omit<Task, "id">, weddingId?: string) => {
    createTask({ task , weddingId });
    setCreateDialogOpen(false);
  };

  const handleUpdateTask = (id: string, data: Partial<Task>, weddingId: string) => {
    updateTask({ id, data ,weddingId });
  };

  const handleDeleteTask = (id: string, weddingId: string) => {
    deleteTask({ id , weddingId});
  };

  const handleAssignTask = (id: string, userId: string, weddingId: string) => {
    assignTask(id, userId || "", weddingId);
  };

  const handleCompleteTask = (id: string, completed: boolean, weddingId: string) => {
    completeTask(id, completed, weddingId);
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
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAssignTask={handleAssignTask}
              onCompleteTask={handleCompleteTask}
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
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TaskForm
              onAddTask={handleCreateTask}
              isSubmitting={isCreating}
              mode="create"
              onCancel={() => setCreateDialogOpen(false)}
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
